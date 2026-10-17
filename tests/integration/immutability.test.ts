import { eq, sql } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/server/db/schema";
import {
  connectTestDb,
  expectRejected,
  makeScenario,
  makeSubmission,
  resetData,
} from "./helpers/db";
import { closePool } from "./helpers/test-database";

const { db, pool } = connectTestDb();
afterAll(() => closePool(pool));
beforeEach(() => resetData(db));

const RESTRICT_VIOLATION = "23001";

async function submissionAndStatusChange() {
  const { assignment, student } = await makeScenario(db);
  const submission = await makeSubmission(db, assignment.id, student.id);
  const [change] = await db
    .insert(schema.statusChanges)
    .values({
      assignmentId: assignment.id,
      submissionId: submission.id,
      changedById: student.id,
      fromStatus: "to_submit",
      toStatus: "awaiting_review",
    })
    .returning();
  return { assignment, student, submission, change: change! };
}

describe("immuabilité des versions (submissions)", () => {
  it("refuse tout UPDATE d'une version", async () => {
    const { submission } = await submissionAndStatusChange();
    await expectRejected(
      db
        .update(schema.submissions)
        .set({ note: "modifiée après coup" })
        .where(eq(schema.submissions.id, submission.id)),
      { code: RESTRICT_VIOLATION },
    );
  });

  it("refuse tout DELETE d'une version", async () => {
    const { submission } = await submissionAndStatusChange();
    await expectRejected(
      db
        .delete(schema.submissions)
        .where(eq(schema.submissions.id, submission.id)),
      { code: RESTRICT_VIOLATION },
    );
  });

  it("refuse l'UPDATE même en SQL brut (la règle ne dépend pas du code applicatif)", async () => {
    const { submission } = await submissionAndStatusChange();
    await expectRejected(
      db.execute(
        sql`update submissions set size_bytes = 1 where id = ${submission.id}`,
      ),
      { code: RESTRICT_VIOLATION },
    );
  });

  it("laisse la version intacte après les tentatives refusées, et accepte toujours un nouvel INSERT", async () => {
    const { assignment, student, submission } =
      await submissionAndStatusChange();
    await db
      .delete(schema.submissions)
      .where(eq(schema.submissions.id, submission.id))
      .catch(() => undefined);
    const [still] = await db
      .select()
      .from(schema.submissions)
      .where(eq(schema.submissions.id, submission.id));
    expect(still?.note).toBeNull();
    await makeSubmission(db, assignment.id, student.id, {
      versionNumber: 2,
      storageKey: "tests/v2.pdf",
    });
  });
});

describe("immuabilité du journal (status_changes)", () => {
  it("refuse UPDATE et DELETE d'un changement de statut", async () => {
    const { change } = await submissionAndStatusChange();
    await expectRejected(
      db
        .update(schema.statusChanges)
        .set({ note: "réécrit" })
        .where(eq(schema.statusChanges.id, change.id)),
      { code: RESTRICT_VIOLATION },
    );
    await expectRejected(
      db
        .delete(schema.statusChanges)
        .where(eq(schema.statusChanges.id, change.id)),
      { code: RESTRICT_VIOLATION },
    );
  });
});
