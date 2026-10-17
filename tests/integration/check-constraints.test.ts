import { sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, it } from "vitest";
import * as schema from "@/server/db/schema";
import {
  connectTestDb,
  expectRejected,
  makeProject,
  makeScenario,
  makeSubmission,
  makeUser,
  resetData,
} from "./helpers/db";
import { closePool } from "./helpers/test-database";

const { db, pool } = connectTestDb();
afterAll(() => closePool(pool));
beforeEach(() => resetData(db));

const CHECK = "23514";

describe("contraintes CHECK", () => {
  it("projects : la fin ne peut pas précéder le début", async () => {
    const teacher = await makeUser(db);
    await expectRejected(
      makeProject(db, teacher.id, {
        startsOn: "2026-06-30",
        endsOn: "2026-01-01",
      }),
      { code: CHECK, constraint: "ck_projects_ends_on_after_starts_on" },
    );
  });

  it("submissions : version ≥ 1, taille > 0, empreinte SHA-256 de 64 caractères hexadécimaux", async () => {
    const { assignment, student } = await makeScenario(db);
    await expectRejected(
      makeSubmission(db, assignment.id, student.id, { versionNumber: 0 }),
      {
        code: CHECK,
        constraint: "ck_submissions_version_number_positive",
      },
    );
    await expectRejected(
      makeSubmission(db, assignment.id, student.id, { sizeBytes: 0 }),
      {
        code: CHECK,
        constraint: "ck_submissions_size_bytes_positive",
      },
    );
    await expectRejected(
      makeSubmission(db, assignment.id, student.id, {
        checksumSha256: "pas-une-empreinte",
      }),
      {
        code: CHECK,
        constraint: "ck_submissions_checksum_sha256_format",
      },
    );
  });

  it("assignments : validation incomplète (date sans auteur) ou sur un statut qui n'est pas « approved »", async () => {
    const { assignment, teacher } = await makeScenario(db);
    await expectRejected(
      db
        .update(schema.assignments)
        .set({ status: "approved", approvedAt: new Date() })
        .where(sql`id = ${assignment.id}`),
      { code: CHECK, constraint: "ck_assignments_approval_both_or_none" },
    );
    await expectRejected(
      db
        .update(schema.assignments)
        .set({
          status: "awaiting_review",
          approvedAt: new Date(),
          approvedById: teacher.id,
        })
        .where(sql`id = ${assignment.id}`),
      { code: CHECK, constraint: "ck_assignments_approval_only_when_approved" },
    );
  });

  it("assignments : accepte une validation complète sur le statut « approved »", async () => {
    const { assignment, teacher } = await makeScenario(db);
    await db
      .update(schema.assignments)
      .set({
        status: "approved",
        approvedAt: new Date(),
        approvedById: teacher.id,
      })
      .where(sql`id = ${assignment.id}`);
  });

  it("comments : « traité » exige la date ET l'auteur, ou aucun des deux", async () => {
    const { assignment, student } = await makeScenario(db);
    const submission = await makeSubmission(db, assignment.id, student.id);
    await expectRejected(
      db.insert(schema.comments).values({
        submissionId: submission.id,
        authorId: student.id,
        body: "à corriger",
        needsFix: true,
        resolvedAt: new Date(),
      }),
      { code: CHECK, constraint: "ck_comments_resolution_both_or_none" },
    );
  });

  it("status_changes : un changement doit changer le statut", async () => {
    const { assignment, student } = await makeScenario(db);
    await expectRejected(
      db.insert(schema.statusChanges).values({
        assignmentId: assignment.id,
        changedById: student.id,
        fromStatus: "to_submit",
        toStatus: "to_submit",
      }),
      { code: CHECK, constraint: "ck_status_changes_from_differs_to" },
    );
  });

  it("notifications : le nombre de tentatives n'est pas négatif", async () => {
    const user = await makeUser(db);
    await expectRejected(
      db.insert(schema.notifications).values({
        userId: user.id,
        type: "approved",
        channel: "email",
        payload: {},
        attemptCount: -1,
      }),
      {
        code: CHECK,
        constraint: "ck_notifications_attempt_count_non_negative",
      },
    );
  });

  it("users : la langue est fr ou en", async () => {
    await expectRejected(makeUser(db, { locale: "xx" }), {
      code: CHECK,
      constraint: "ck_users_locale",
    });
  });
});

describe("types énumérés", () => {
  it("refuse une valeur qui n'existe pas dans l'énumération (22P02)", async () => {
    const teacher = await makeUser(db);
    await expectRejected(
      db.execute(
        sql`insert into projects (created_by_id, title, brief, starts_on, ends_on, status, invite_code)
            values (${teacher.id}, 't', 'b', '2026-01-01', '2026-02-01', 'bogus', 'code-enum-0123456789abcdef0123')`,
      ),
      { code: "22P02" },
    );
  });

  it("refuse un statut d'affectation inconnu", async () => {
    const { assignment } = await makeScenario(db);
    await expectRejected(
      db.execute(
        sql`update assignments set status = 'terminé' where id = ${assignment.id}`,
      ),
      { code: "22P02" },
    );
  });
});
