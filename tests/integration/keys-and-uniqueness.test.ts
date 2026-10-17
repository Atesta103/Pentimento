import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/server/db/schema";
import {
  connectTestDb,
  expectRejected,
  makeAssignment,
  makeDeliverable,
  makeGroup,
  makeProject,
  makeScenario,
  makeUser,
  resetData,
} from "./helpers/db";
import { closePool } from "./helpers/test-database";

const { db, pool } = connectTestDb();
afterAll(() => closePool(pool));
beforeEach(() => resetData(db));

const UNIQUE = "23505";
const FOREIGN_KEY = "23503";

describe("unicités", () => {
  it("refuse un doublon (project_id, user_id) : une personne n'est membre qu'une fois d'un projet", async () => {
    const { project, student } = await makeScenario(db);
    await db
      .insert(schema.projectMembers)
      .values({ projectId: project.id, userId: student.id, role: "student" });
    await expectRejected(
      db
        .insert(schema.projectMembers)
        .values({ projectId: project.id, userId: student.id, role: "teacher" }),
      { code: UNIQUE, constraint: "uq_project_members_project_id_user_id" },
    );
  });

  it("refuse deux affectations du même livrable au même groupe", async () => {
    const { assignment } = await makeScenario(db);
    await expectRejected(
      makeAssignment(db, {
        projectId: assignment.projectId,
        deliverableId: assignment.deliverableId,
        groupId: assignment.groupId,
      }),
      { code: UNIQUE, constraint: "uq_assignments_deliverable_id_group_id" },
    );
  });

  it("refuse deux « v2 » pour la même affectation", async () => {
    const { assignment, student } = await makeScenario(db);
    const values = {
      assignmentId: assignment.id,
      submittedById: student.id,
      versionNumber: 2,
      originalFilename: "a.pdf",
      mimeType: "application/pdf",
      sizeBytes: 10,
      checksumSha256: "b".repeat(64),
    };
    await db
      .insert(schema.submissions)
      .values({ ...values, storageKey: "k/1" });
    await expectRejected(
      db.insert(schema.submissions).values({ ...values, storageKey: "k/2" }),
      {
        code: UNIQUE,
        constraint: "uq_submissions_assignment_id_version_number",
      },
    );
  });

  it("refuse un e-mail déjà pris, même écrit avec d'autres majuscules", async () => {
    await makeUser(db, { email: "alice@test.local" });
    await expectRejected(makeUser(db, { email: "alice@test.local" }), {
      code: UNIQUE,
      constraint: "uq_users_email",
    });
    await expectRejected(makeUser(db, { email: "Alice@test.local" }), {
      code: "23514",
      constraint: "ck_users_email_lowercase",
    });
  });

  it("refuse un code d'invitation déjà utilisé et un slug d'établissement en double", async () => {
    const teacher = await makeUser(db);
    await makeProject(db, teacher.id, {
      inviteCode: "duplicate-code-0123456789abcdef",
    });
    await expectRejected(
      makeProject(db, teacher.id, {
        inviteCode: "duplicate-code-0123456789abcdef",
      }),
      { code: UNIQUE, constraint: "uq_projects_invite_code" },
    );
    await db.insert(schema.institutions).values({ name: "A", slug: "ecole" });
    await expectRejected(
      db.insert(schema.institutions).values({ name: "B", slug: "ecole" }),
      { code: UNIQUE, constraint: "uq_institutions_slug" },
    );
  });
});

describe("clés composites : le groupe doit appartenir au même projet", () => {
  it("refuse un membre dont le group_id appartient à un AUTRE projet", async () => {
    const { project, student } = await makeScenario(db);
    const otherProject = await makeProject(db, (await makeUser(db)).id);
    const foreignGroup = await makeGroup(db, otherProject.id);
    await expectRejected(
      db.insert(schema.projectMembers).values({
        projectId: project.id,
        userId: student.id,
        groupId: foreignGroup.id,
        role: "student",
      }),
      {
        code: FOREIGN_KEY,
        constraint: "fk_project_members_project_id_group_id",
      },
    );
  });

  it("accepte un membre sans groupe (pas encore rattaché) et un membre avec un groupe du bon projet", async () => {
    const { project, group, student } = await makeScenario(db);
    const other = await makeUser(db);
    await db
      .insert(schema.projectMembers)
      .values({ projectId: project.id, userId: other.id, role: "student" });
    await db.insert(schema.projectMembers).values({
      projectId: project.id,
      userId: student.id,
      groupId: group.id,
      role: "student",
    });
    const members = await db
      .select()
      .from(schema.projectMembers)
      .where(eq(schema.projectMembers.projectId, project.id));
    expect(members).toHaveLength(2);
  });

  it("refuse une affectation dont le groupe est d'un autre projet que le livrable", async () => {
    const { project, deliverable } = await makeScenario(db);
    const otherProject = await makeProject(db, (await makeUser(db)).id);
    const foreignGroup = await makeGroup(db, otherProject.id);
    await expectRejected(
      makeAssignment(db, {
        projectId: project.id,
        deliverableId: deliverable.id,
        groupId: foreignGroup.id,
      }),
      { code: FOREIGN_KEY, constraint: "fk_assignments_project_id_group_id" },
    );
  });

  it("refuse une affectation dont le livrable est d'un autre projet que le project_id annoncé", async () => {
    const { project, group } = await makeScenario(db);
    const otherProject = await makeProject(db, (await makeUser(db)).id);
    const foreignDeliverable = await makeDeliverable(db, otherProject.id);
    await expectRejected(
      makeAssignment(db, {
        projectId: project.id,
        deliverableId: foreignDeliverable.id,
        groupId: group.id,
      }),
      {
        code: FOREIGN_KEY,
        constraint: "fk_assignments_project_id_deliverable_id",
      },
    );
  });
});

describe("pas de suppression en cascade : la base refuse d'effacer ce qui est référencé", () => {
  it("refuse de supprimer un utilisateur qui a créé un projet", async () => {
    const { teacher } = await makeScenario(db);
    await expectRejected(
      db.delete(schema.users).where(eq(schema.users.id, teacher.id)),
      {
        code: FOREIGN_KEY,
        constraint: "fk_projects_created_by_id",
      },
    );
  });

  it("refuse de supprimer un groupe affecté, un livrable affecté et un projet qui a des groupes", async () => {
    const { group, deliverable, project } = await makeScenario(db);
    await expectRejected(
      db.delete(schema.groups).where(eq(schema.groups.id, group.id)),
      { code: FOREIGN_KEY },
    );
    await expectRejected(
      db
        .delete(schema.deliverables)
        .where(eq(schema.deliverables.id, deliverable.id)),
      { code: FOREIGN_KEY },
    );
    await expectRejected(
      db.delete(schema.projects).where(eq(schema.projects.id, project.id)),
      { code: FOREIGN_KEY },
    );
  });
});
