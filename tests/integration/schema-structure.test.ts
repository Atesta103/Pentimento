import { sql } from "drizzle-orm";
import { afterAll, describe, expect, it } from "vitest";
import { closePool } from "./helpers/test-database";
import { connectTestDb } from "./helpers/db";

const { db, pool } = connectTestDb();
afterAll(() => closePool(pool));

const rows = async <T>(query: ReturnType<typeof sql>) =>
  (await db.execute(query)).rows as T[];

describe("structure de la base après migration", () => {
  it("contient exactement les 12 tables du MVP", async () => {
    const tables = await rows<{ table_name: string }>(
      sql`select table_name from information_schema.tables where table_schema = 'public' and table_type = 'BASE TABLE' order by 1`,
    );
    expect(tables.map((t) => t.table_name)).toEqual([
      "assignments",
      "comments",
      "deliverables",
      "groups",
      "institutions",
      "notifications",
      "project_members",
      "projects",
      "status_changes",
      "submissions",
      "templates",
      "users",
    ]);
  });

  it("définit les 5 types énumérés avec leurs valeurs", async () => {
    const enums = await rows<{ name: string; values: string[] }>(
      sql`select t.typname as name, array_agg(e.enumlabel::text order by e.enumsortorder) as values
          from pg_type t join pg_enum e on e.enumtypid = t.oid group by t.typname order by 1`,
    );
    expect(enums).toEqual([
      {
        name: "assignment_status",
        values: [
          "to_submit",
          "awaiting_review",
          "changes_requested",
          "approved",
        ],
      },
      { name: "member_role", values: ["teacher", "student"] },
      { name: "notification_channel", values: ["email", "in_app"] },
      {
        name: "notification_type",
        values: ["submission_received", "changes_requested", "approved"],
      },
      { name: "project_status", values: ["draft", "active", "archived"] },
    ]);
  });

  it("n'a AUCUNE clé étrangère en ON DELETE CASCADE (le travail des étudiants ne s'efface pas en cascade)", async () => {
    const fks = await rows<{ constraint_name: string; delete_rule: string }>(
      sql`select constraint_name, delete_rule from information_schema.referential_constraints where constraint_schema = 'public'`,
    );
    expect(fks.length).toBeGreaterThan(15);
    const notRestrict = fks.filter((fk) => fk.delete_rule !== "RESTRICT");
    expect(notRestrict).toEqual([]);
  });

  it("nomme toutes les contraintes et tous les index selon la convention (uq_, fk_, ck_, idx_)", async () => {
    const constraints = await rows<{ name: string; type: string }>(
      sql`select conname as name, contype as type from pg_constraint
          where connamespace = 'public'::regnamespace and contype in ('u','f','c')`,
    );
    const prefix = { u: "uq_", f: "fk_", c: "ck_" } as const;
    const bad = constraints.filter(
      (c) => !c.name.startsWith(prefix[c.type as keyof typeof prefix]),
    );
    expect(bad).toEqual([]);

    const indexes = await rows<{ name: string }>(
      sql`select indexname as name from pg_indexes where schemaname = 'public'
          and indexname not like '%\_pkey' and indexname not like 'uq\_%'`,
    );
    expect(indexes.filter((i) => !i.name.startsWith("idx_"))).toEqual([]);
  });

  it("installe les triggers d'immuabilité sur submissions et status_changes (et sur elles seules)", async () => {
    const triggers = await rows<{ table_name: string; trigger_name: string }>(
      sql`select event_object_table as table_name, trigger_name from information_schema.triggers
          where trigger_schema = 'public' group by 1, 2 order by 1`,
    );
    expect(triggers).toEqual([
      {
        table_name: "status_changes",
        trigger_name: "tr_status_changes_immutable",
      },
      { table_name: "submissions", trigger_name: "tr_submissions_immutable" },
    ]);
  });
});
