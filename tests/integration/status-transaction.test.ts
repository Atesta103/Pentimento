import { eq } from "drizzle-orm";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import * as schema from "@/server/db/schema";
import { connectTestDb, makeScenario, resetData } from "./helpers/db";
import { closePool } from "./helpers/test-database";

const { db, pool } = connectTestDb();
afterAll(() => closePool(pool));
beforeEach(() => resetData(db));

/**
 * Au niveau de la base seulement : le statut courant et le journal s'écrivent dans la
 * même transaction, donc l'échec de l'un annule l'autre. Les services (phase 5) devront
 * utiliser cette garantie ; ils auront leur propre test d'atomicité.
 */
describe("statut courant et journal : tout ou rien", () => {
  it("annule le changement de statut si l'écriture du journal échoue", async () => {
    const { assignment, teacher } = await makeScenario(db);

    await expect(
      db.transaction(async (tx) => {
        await tx
          .update(schema.assignments)
          .set({ status: "awaiting_review" })
          .where(eq(schema.assignments.id, assignment.id));
        // Journal invalide (de = vers) : le CHECK refuse, la transaction entière est annulée.
        await tx.insert(schema.statusChanges).values({
          assignmentId: assignment.id,
          changedById: teacher.id,
          fromStatus: "awaiting_review",
          toStatus: "awaiting_review",
        });
      }),
    ).rejects.toThrow();

    const [after] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignment.id));
    expect(after?.status).toBe("to_submit");
    expect(await db.select().from(schema.statusChanges)).toHaveLength(0);
  });

  it("valide les deux écritures ensemble quand tout va bien", async () => {
    const { assignment, teacher } = await makeScenario(db);

    await db.transaction(async (tx) => {
      await tx
        .update(schema.assignments)
        .set({ status: "awaiting_review" })
        .where(eq(schema.assignments.id, assignment.id));
      await tx.insert(schema.statusChanges).values({
        assignmentId: assignment.id,
        changedById: teacher.id,
        fromStatus: "to_submit",
        toStatus: "awaiting_review",
      });
    });

    const [after] = await db
      .select()
      .from(schema.assignments)
      .where(eq(schema.assignments.id, assignment.id));
    expect(after?.status).toBe("awaiting_review");
    expect(await db.select().from(schema.statusChanges)).toHaveLength(1);
  });
});
