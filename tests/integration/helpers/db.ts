import { sql } from "drizzle-orm";
import { expect } from "vitest";
import { createDb } from "@/server/db/client";
import * as schema from "@/server/db/schema";
import { testDatabaseUrl } from "./test-database";

export function connectTestDb() {
  return createDb(testDatabaseUrl());
}

export type TestDb = ReturnType<typeof connectTestDb>["db"];

/** Vide les 12 tables. TRUNCATE ne déclenche pas les triggers d'immuabilité (ils visent UPDATE/DELETE). */
export async function resetData(db: TestDb) {
  await db.execute(
    sql`TRUNCATE institutions, users, projects, groups, project_members, templates, deliverables, assignments, submissions, comments, status_changes, notifications RESTART IDENTITY CASCADE`,
  );
}

/** Erreur PostgreSQL d'origine, que Drizzle enveloppe dans `cause`. */
type PgError = { code?: string; constraint?: string; message: string };

function unwrap(error: unknown): PgError {
  const err = error as { cause?: unknown } & PgError;
  return (err.cause as PgError | undefined) ?? err;
}

/**
 * Attend que la requête soit REFUSÉE par la base, avec le bon code SQLSTATE
 * (23505 unicité, 23503 clé étrangère, 23514 CHECK, 23001 interdit par trigger,
 * 22P02 valeur d'énumération inconnue) et, si précisé, la contrainte visée.
 */
export async function expectRejected(
  query: PromiseLike<unknown>,
  expected: { code: string; constraint?: string },
) {
  let caught: unknown;
  try {
    await query;
  } catch (error) {
    caught = error;
  }
  expect(caught, "la base aurait dû refuser cette requête").toBeDefined();
  const pg = unwrap(caught);
  expect(pg.code, pg.message).toBe(expected.code);
  if (expected.constraint) expect(pg.constraint).toBe(expected.constraint);
}

// --- Fabriques de lignes valides : chaque test ne précise que ce qu'il veut casser. ---

let counter = 0;
const next = () => ++counter;

export async function makeUser(
  db: TestDb,
  overrides: Partial<typeof schema.users.$inferInsert> = {},
) {
  const n = next();
  const [row] = await db
    .insert(schema.users)
    .values({
      email: `user${n}@test.local`,
      firstName: "Prénom",
      lastName: `Nom${n}`,
      ...overrides,
    })
    .returning();
  return row!;
}

export async function makeProject(
  db: TestDb,
  createdById: string,
  overrides: Partial<typeof schema.projects.$inferInsert> = {},
) {
  const n = next();
  const [row] = await db
    .insert(schema.projects)
    .values({
      createdById,
      title: `Projet ${n}`,
      brief: "Brief",
      startsOn: "2026-01-01",
      endsOn: "2026-06-30",
      status: "active",
      inviteCode: `code-${n}-${"x".repeat(24)}`,
      ...overrides,
    })
    .returning();
  return row!;
}

export async function makeGroup(
  db: TestDb,
  projectId: string,
  name = `Groupe ${next()}`,
) {
  const [row] = await db
    .insert(schema.groups)
    .values({ projectId, name })
    .returning();
  return row!;
}

export async function makeDeliverable(
  db: TestDb,
  projectId: string,
  overrides: Partial<typeof schema.deliverables.$inferInsert> = {},
) {
  const n = next();
  const [row] = await db
    .insert(schema.deliverables)
    .values({
      projectId,
      title: `Livrable ${n}`,
      instructions: "Consigne",
      dueAt: new Date("2026-03-01T12:00:00Z"),
      sortOrder: n,
      ...overrides,
    })
    .returning();
  return row!;
}

export async function makeAssignment(
  db: TestDb,
  ids: { projectId: string; deliverableId: string; groupId: string },
  overrides: Partial<typeof schema.assignments.$inferInsert> = {},
) {
  const [row] = await db
    .insert(schema.assignments)
    .values({ ...ids, ...overrides })
    .returning();
  return row!;
}

export async function makeSubmission(
  db: TestDb,
  assignmentId: string,
  submittedById: string,
  overrides: Partial<typeof schema.submissions.$inferInsert> = {},
) {
  const n = next();
  const [row] = await db
    .insert(schema.submissions)
    .values({
      assignmentId,
      submittedById,
      versionNumber: 1,
      storageKey: `tests/${n}/v1.pdf`,
      originalFilename: "rendu.pdf",
      mimeType: "application/pdf",
      sizeBytes: 1024,
      checksumSha256: "a".repeat(64),
      ...overrides,
    })
    .returning();
  return row!;
}

/** Un projet complet avec un enseignant, un groupe, un livrable et leur affectation. */
export async function makeScenario(db: TestDb) {
  const teacher = await makeUser(db);
  const student = await makeUser(db);
  const project = await makeProject(db, teacher.id);
  const group = await makeGroup(db, project.id);
  const deliverable = await makeDeliverable(db, project.id);
  const assignment = await makeAssignment(db, {
    projectId: project.id,
    deliverableId: deliverable.id,
    groupId: group.id,
  });
  return { teacher, student, project, group, deliverable, assignment };
}
