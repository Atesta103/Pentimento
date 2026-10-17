import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import * as schema from "@/server/db/schema";
import { resetAllData, seedDatabase } from "@/server/db/seed";
import { connectTestDb } from "./helpers/db";
import { closePool } from "./helpers/test-database";

const { db, pool } = connectTestDb();
const NOW = new Date("2026-10-18T10:00:00Z");

beforeAll(async () => {
  await resetAllData(db);
  await seedDatabase(db, NOW);
});
afterAll(() => closePool(pool));

const rows = async <T>(query: ReturnType<typeof sql>) =>
  (await db.execute(query)).rows as T[];

describe("jeu de données de démonstration", () => {
  it("contient 1 établissement, 1 enseignant et 6 étudiants", async () => {
    expect(await db.select().from(schema.institutions)).toHaveLength(1);
    const members = await rows<{ role: string; n: string }>(
      sql`select role::text as role, count(*)::text as n from project_members where project_id = (select id from projects where status = 'active') group by role order by role::text`,
    );
    expect(members).toEqual([
      { role: "student", n: "6" },
      { role: "teacher", n: "1" },
    ]);
  });

  it("a 3 groupes dans le projet actif, dont un d'une seule personne", async () => {
    const sizes = await rows<{ size: string }>(
      sql`select count(pm.id)::text as size from groups g left join project_members pm on pm.group_id = g.id group by g.id order by 1`,
    );
    expect(sizes.map((r) => r.size)).toEqual(["1", "2", "3"]);
  });

  it("a 4 livrables et une affectation pour chaque couple livrable × groupe (12)", async () => {
    expect(await db.select().from(schema.deliverables)).toHaveLength(4);
    expect(await db.select().from(schema.assignments)).toHaveLength(12);
  });

  it("montre les 4 statuts", async () => {
    const statuses = await rows<{ status: string }>(
      sql`select distinct status::text from assignments order by 1`,
    );
    expect(statuses.map((r) => r.status)).toEqual([
      "approved",
      "awaiting_review",
      "changes_requested",
      "to_submit",
    ]);
  });

  it("a un livrable en retard : échu, sans validation, et rien déposé", async () => {
    const late = await rows<{ n: string }>(
      sql`select count(*)::text as n from assignments a join deliverables d on d.id = a.deliverable_id
          where d.due_at < ${NOW.toISOString()}::timestamptz and a.status = 'to_submit'`,
    );
    expect(Number(late[0]?.n)).toBeGreaterThanOrEqual(1);
  });

  it("a un dépôt tardif (déposé après l'échéance, jamais refusé)", async () => {
    const tardy = await rows<{ n: string }>(
      sql`select count(*)::text as n from submissions s join assignments a on a.id = s.assignment_id
          join deliverables d on d.id = a.deliverable_id where s.submitted_at > d.due_at`,
    );
    expect(Number(tardy[0]?.n)).toBeGreaterThanOrEqual(1);
  });

  it("a un livrable avec 3 versions consécutives", async () => {
    const versions = await rows<{ versions: number[] }>(
      sql`select array_agg(version_number order by version_number) as versions from submissions group by assignment_id having count(*) = 3`,
    );
    expect(versions).toEqual([{ versions: [1, 2, 3] }]);
  });

  it("a des corrections demandées dont une traitée et une encore à faire", async () => {
    const [resolved, open] = await Promise.all([
      rows<{ n: string }>(
        sql`select count(*)::text as n from comments where needs_fix and resolved_at is not null`,
      ),
      rows<{ n: string }>(
        sql`select count(*)::text as n from comments where needs_fix and resolved_at is null`,
      ),
    ]);
    expect(Number(resolved[0]?.n)).toBeGreaterThanOrEqual(1);
    expect(Number(open[0]?.n)).toBeGreaterThanOrEqual(1);
  });

  it("a un projet brouillon et un projet archivé, pour tester les refus", async () => {
    const statuses = await rows<{ status: string }>(
      sql`select status::text from projects order by 1`,
    );
    expect(statuses.map((r) => r.status)).toEqual([
      "active",
      "archived",
      "draft",
    ]);
  });

  it("COHÉRENCE : le statut courant de chaque affectation égale le dernier changement du journal", async () => {
    const mismatches = await rows<{
      id: string;
      status: string;
      journal: string | null;
    }>(
      sql`select a.id, a.status::text as status,
            (select sc.to_status::text from status_changes sc where sc.assignment_id = a.id
             order by sc.changed_at desc, sc.id limit 1) as journal
          from assignments a
          where a.status::text is distinct from coalesce(
            (select sc.to_status::text from status_changes sc where sc.assignment_id = a.id
             order by sc.changed_at desc, sc.id limit 1), 'to_submit')`,
    );
    expect(mismatches).toEqual([]);
  });

  it("COHÉRENCE : le journal s'enchaîne (chaque « de » est le « vers » du précédent)", async () => {
    const broken = await rows<{ assignment_id: string }>(
      sql`select assignment_id from (
            select assignment_id, from_status,
              lag(to_status) over (partition by assignment_id order by changed_at, id) as previous_to,
              row_number() over (partition by assignment_id order by changed_at, id) as rn
            from status_changes) t
          where (rn = 1 and from_status <> 'to_submit') or (rn > 1 and from_status <> previous_to)`,
    );
    expect(broken).toEqual([]);
  });

  it("est reproductible : mêmes identifiants après un nouveau chargement", async () => {
    const before = await rows<{ id: string }>(
      sql`select id from assignments order by id`,
    );
    await resetAllData(db);
    await seedDatabase(db, NOW);
    expect(
      await rows<{ id: string }>(sql`select id from assignments order by id`),
    ).toEqual(before);
  });
});
