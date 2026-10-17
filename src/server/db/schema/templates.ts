import { foreignKey, pgTable, text, uuid } from "drizzle-orm/pg-core";
import { createdAt, id } from "./columns";
import { institutions } from "./institutions";

export const templates = pgTable(
  "templates",
  {
    id: id(),
    // Nul = modèle commun à tous les établissements.
    institutionId: uuid(),
    title: text().notNull(),
    description: text().notNull(),
    category: text().notNull(),
    locale: text().notNull(),
    // Clé générée côté serveur ; le nom d'origine n'est jamais un chemin.
    storageKey: text().notNull(),
    originalFilename: text().notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    foreignKey({
      name: "fk_templates_institution_id",
      columns: [t.institutionId],
      foreignColumns: [institutions.id],
    }).onDelete("restrict"),
  ],
);
