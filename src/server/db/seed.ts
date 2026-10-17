import { createHash } from "node:crypto";
import { sql } from "drizzle-orm";
import type { Database } from "./client";
import * as s from "./schema";

/**
 * Jeu de données de démonstration (docs/data/schema-notes.md, « Données de démonstration »).
 * Reproductible : les identifiants dérivent d'un nom, les dates sont relatives à « maintenant ».
 * Les mots de passe de démonstration viendront avec l'authentification (phase 4) : la table
 * `users` n'en contient pas, ils appartiendront aux tables de la bibliothèque d'auth.
 */

/** UUID stable pour un nom donné (même nom = même identifiant à chaque exécution). */
export function seedId(name: string): string {
  const h = createHash("sha1").update(`pentimento-seed:${name}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-a${h.slice(17, 20)}-${h.slice(20, 32)}`;
}

const sha256 = (value: string) =>
  createHash("sha256").update(value).digest("hex");

const DAY = 24 * 60 * 60 * 1000;
const dayString = (date: Date) => date.toISOString().slice(0, 10);

/** Vide les 12 tables. Refuse de s'exécuter en production. */
export async function resetAllData(db: Database) {
  if (process.env.NODE_ENV === "production") {
    throw new Error("resetAllData est interdit en production.");
  }
  await db.execute(
    sql`TRUNCATE institutions, users, projects, groups, project_members, templates, deliverables, assignments, submissions, comments, status_changes, notifications RESTART IDENTITY CASCADE`,
  );
}

type Status = (typeof s.assignmentStatus.enumValues)[number];

export async function seedDatabase(db: Database, now: Date = new Date()) {
  const at = (days: number) => new Date(now.getTime() + days * DAY);

  // --- Établissement, enseignant, 6 étudiants -------------------------------------------
  const institutionId = seedId("institution");
  await db.insert(s.institutions).values({
    id: institutionId,
    name: "École de démonstration",
    slug: "demo",
  });

  const teacherId = seedId("teacher");
  const studentNames = [
    "Léa Bernard",
    "Hugo Petit",
    "Inès Moreau",
    "Noah Laurent",
    "Jade Simon",
    "Louis Garnier",
  ];
  const studentIds = studentNames.map((_, i) => seedId(`student-${i + 1}`));

  await db.insert(s.users).values([
    {
      id: teacherId,
      institutionId,
      email: "camille.martin@demo.test",
      firstName: "Camille",
      lastName: "Martin",
      emailVerifiedAt: at(-60),
    },
    ...studentNames.map((full, i) => {
      const [firstName = "", lastName = ""] = full.split(" ");
      return {
        id: studentIds[i]!,
        institutionId,
        email: `${firstName.toLowerCase().replace("é", "e").replace("è", "e").replace("ï", "i")}.${lastName.toLowerCase()}@demo.test`,
        firstName,
        lastName,
        emailVerifiedAt: at(-55),
      };
    }),
  ]);

  // --- Trois projets : actif (le vrai terrain de démo), brouillon, archivé ----------------
  const activeId = seedId("project-active");
  const draftId = seedId("project-draft");
  const archivedId = seedId("project-archived");
  await db.insert(s.projects).values([
    {
      id: activeId,
      institutionId,
      createdById: teacherId,
      title: "Projet fil rouge : application mobile",
      brief:
        "Concevoir et présenter une application mobile pour un besoin réel.",
      objectives: "Savoir cadrer un besoin, prototyper, présenter.",
      startsOn: dayString(at(-30)),
      endsOn: dayString(at(60)),
      status: "active",
      inviteCode: sha256("invite-active").slice(0, 32),
      inviteExpiresAt: at(30),
    },
    {
      id: draftId,
      institutionId,
      createdById: teacherId,
      title: "Projet en préparation",
      brief: "Brouillon pas encore ouvert aux étudiants.",
      startsOn: dayString(at(30)),
      endsOn: dayString(at(120)),
      status: "draft",
      inviteCode: sha256("invite-draft").slice(0, 32),
    },
    {
      id: archivedId,
      institutionId,
      createdById: teacherId,
      title: "Projet de l'an dernier",
      brief: "Projet terminé et archivé.",
      startsOn: dayString(at(-400)),
      endsOn: dayString(at(-300)),
      status: "archived",
      inviteCode: sha256("invite-archived").slice(0, 32),
      inviteExpiresAt: at(-300),
    },
  ]);

  // --- Groupes : trois, dont un d'une seule personne ------------------------------------
  const groupIds = {
    alpha: seedId("group-alpha"),
    bravo: seedId("group-bravo"),
    charlie: seedId("group-charlie"),
  };
  await db.insert(s.groups).values([
    { id: groupIds.alpha, projectId: activeId, name: "Alpha" },
    { id: groupIds.bravo, projectId: activeId, name: "Bravo" },
    { id: groupIds.charlie, projectId: activeId, name: "Charlie (en solo)" },
  ]);

  const groupOfStudent = [
    groupIds.alpha,
    groupIds.alpha,
    groupIds.alpha,
    groupIds.bravo,
    groupIds.bravo,
    groupIds.charlie,
  ];
  await db.insert(s.projectMembers).values([
    { projectId: activeId, userId: teacherId, role: "teacher" },
    { projectId: draftId, userId: teacherId, role: "teacher" },
    { projectId: archivedId, userId: teacherId, role: "teacher" },
    ...studentIds.map((userId, i) => ({
      projectId: activeId,
      userId,
      groupId: groupOfStudent[i]!,
      role: "student" as const,
    })),
  ]);

  // --- Modèles de livrables (bibliothèque, MVP-16) --------------------------------------
  const templateId = seedId("template-specs");
  await db.insert(s.templates).values([
    {
      id: templateId,
      title: "Modèle de cahier des charges",
      description: "Structure type d'un cahier des charges.",
      category: "cadrage",
      locale: "fr",
      storageKey: "templates/cahier-des-charges.docx",
      originalFilename: "cahier-des-charges.docx",
    },
    {
      id: seedId("template-canvas"),
      title: "Business model canvas",
      description: "Canvas vierge à compléter.",
      category: "business",
      locale: "en",
      storageKey: "templates/business-model-canvas.pdf",
      originalFilename: "business-model-canvas.pdf",
    },
  ]);

  // --- Quatre livrables : deux échus, deux à venir ---------------------------------------
  const deliverableIds = ["specs", "mockups", "prototype", "report"].map((k) =>
    seedId(`deliverable-${k}`),
  );
  const [dSpecs, dMockups, dPrototype, dReport] = deliverableIds as [
    string,
    string,
    string,
    string,
  ];
  await db.insert(s.deliverables).values([
    {
      id: dSpecs,
      projectId: activeId,
      templateId,
      title: "Cahier des charges",
      instructions: "Décrire le besoin, la cible et le périmètre.",
      dueAt: at(-20),
      sortOrder: 1,
    },
    {
      id: dMockups,
      projectId: activeId,
      title: "Maquettes",
      instructions: "Maquettes des écrans principaux.",
      dueAt: at(-5),
      sortOrder: 2,
    },
    {
      id: dPrototype,
      projectId: activeId,
      title: "Prototype",
      instructions: "Prototype cliquable.",
      dueAt: at(10),
      sortOrder: 3,
    },
    {
      id: dReport,
      projectId: activeId,
      title: "Rapport final",
      instructions: "Rapport de synthèse et bilan.",
      dueAt: at(40),
      sortOrder: 4,
    },
  ]);

  // --- Affectations : un livrable × un groupe, partout (12), toutes « à rendre » au départ.
  // Les dépôts ci-dessous les font avancer ; le statut final est posé avec le journal.
  const deliverableKey = {
    specs: dSpecs,
    mockups: dMockups,
    prototype: dPrototype,
    report: dReport,
  };
  const assignmentId = (group: string, key: string) =>
    seedId(`assignment-${group}-${key}`);

  const assignmentRows = (
    Object.keys(groupIds) as (keyof typeof groupIds)[]
  ).flatMap((group) =>
    (Object.keys(deliverableKey) as (keyof typeof deliverableKey)[]).map(
      (key) => ({
        id: assignmentId(group, key),
        projectId: activeId,
        deliverableId: deliverableKey[key],
        groupId: groupIds[group],
        status: "to_submit" as Status,
        lastActivityAt: at(-30),
      }),
    ),
  );
  await db.insert(s.assignments).values(assignmentRows);

  // --- Dépôts, commentaires et journal : une histoire cohérente par affectation ---------
  const submit = async (
    group: string,
    key: string,
    version: number,
    days: number,
    by: string,
  ) => {
    const storageKey = `seed/${group}-${key}/v${version}.pdf`;
    const id = seedId(`submission-${group}-${key}-v${version}`);
    await db.insert(s.submissions).values({
      id,
      assignmentId: assignmentId(group, key),
      submittedById: by,
      versionNumber: version,
      note:
        version === 1
          ? "Première version."
          : `Version ${version} avec les corrections.`,
      storageKey,
      originalFilename: `${key}-v${version}.pdf`,
      mimeType: "application/pdf",
      sizeBytes: 120_000 + version * 4_096,
      checksumSha256: sha256(storageKey),
      submittedAt: at(days),
    });
    return id;
  };
  const change = (
    group: string,
    key: string,
    from: Status,
    to: Status,
    days: number,
    by: string,
    submissionId?: string,
    note?: string,
  ) =>
    db.insert(s.statusChanges).values({
      assignmentId: assignmentId(group, key),
      submissionId,
      changedById: by,
      fromStatus: from,
      toStatus: to,
      note,
      changedAt: at(days),
    });
  const setStatus = (
    group: string,
    key: string,
    status: Status,
    days: number,
    approved = false,
  ) =>
    db
      .update(s.assignments)
      .set({
        status,
        lastActivityAt: at(days),
        ...(approved ? { approvedById: teacherId, approvedAt: at(days) } : {}),
      })
      .where(sql`id = ${assignmentId(group, key)}`);
  const comment = (
    submissionId: string,
    authorId: string,
    body: string,
    days: number,
    needsFix = false,
    resolvedDays?: number,
    resolvedBy?: string,
  ) =>
    db.insert(s.comments).values({
      submissionId,
      authorId,
      body,
      needsFix,
      createdAt: at(days),
      ...(resolvedDays !== undefined
        ? {
            resolvedAt: at(resolvedDays),
            resolvedById: resolvedBy ?? studentIds[0]!,
          }
        : {}),
    });

  const [lea, hugo, , noah, , louis] = studentIds as [
    string,
    string,
    string,
    string,
    string,
    string,
  ];

  // Alpha / Cahier des charges : déposé à temps, validé.
  const aSpecs1 = await submit("alpha", "specs", 1, -22, lea);
  await change(
    "alpha",
    "specs",
    "to_submit",
    "awaiting_review",
    -22,
    lea,
    aSpecs1,
  );
  await comment(aSpecs1, teacherId, "Très clair, bravo.", -19);
  await change(
    "alpha",
    "specs",
    "awaiting_review",
    "approved",
    -18,
    teacherId,
    aSpecs1,
  );
  await setStatus("alpha", "specs", "approved", -18, true);

  // Alpha / Maquettes : TROIS versions (aller-retours), attend à nouveau le retour.
  const aMock1 = await submit("alpha", "mockups", 1, -9, lea);
  await change(
    "alpha",
    "mockups",
    "to_submit",
    "awaiting_review",
    -9,
    lea,
    aMock1,
  );
  await comment(
    aMock1,
    teacherId,
    "Le parcours d'inscription manque.",
    -8,
    true,
    -7,
    hugo,
  );
  await comment(
    aMock1,
    teacherId,
    "Harmoniser les couleurs entre écrans.",
    -8,
    true,
    -7,
    hugo,
  );
  await change(
    "alpha",
    "mockups",
    "awaiting_review",
    "changes_requested",
    -8,
    teacherId,
    aMock1,
    "Deux corrections demandées.",
  );
  const aMock2 = await submit("alpha", "mockups", 2, -7, hugo);
  await change(
    "alpha",
    "mockups",
    "changes_requested",
    "awaiting_review",
    -7,
    hugo,
    aMock2,
  );
  await comment(
    aMock2,
    teacherId,
    "Le bouton principal est trop discret.",
    -6,
    true,
    -5,
    lea,
  );
  await change(
    "alpha",
    "mockups",
    "awaiting_review",
    "changes_requested",
    -6,
    teacherId,
    aMock2,
  );
  const aMock3 = await submit("alpha", "mockups", 3, -4, lea);
  await change(
    "alpha",
    "mockups",
    "changes_requested",
    "awaiting_review",
    -4,
    lea,
    aMock3,
  );
  await setStatus("alpha", "mockups", "awaiting_review", -4);

  // Bravo / Cahier des charges : corrections demandées, une traitée et une encore à faire (en retard).
  const bSpecs1 = await submit("bravo", "specs", 1, -21, noah);
  await change(
    "bravo",
    "specs",
    "to_submit",
    "awaiting_review",
    -21,
    noah,
    bSpecs1,
  );
  await comment(bSpecs1, teacherId, "Préciser la cible.", -19, true, -18, noah);
  await comment(
    bSpecs1,
    teacherId,
    "Ajouter les contraintes techniques.",
    -19,
    true,
  );
  await comment(bSpecs1, noah, "On s'en occupe cette semaine.", -18);
  await change(
    "bravo",
    "specs",
    "awaiting_review",
    "changes_requested",
    -19,
    teacherId,
    bSpecs1,
    "Deux points à corriger.",
  );
  await setStatus("bravo", "specs", "changes_requested", -18);

  // Bravo / Maquettes : dépôt TARDIF (après l'échéance, jamais refusé), en attente du prof.
  const bMock1 = await submit("bravo", "mockups", 1, -2, noah);
  await change(
    "bravo",
    "mockups",
    "to_submit",
    "awaiting_review",
    -2,
    noah,
    bMock1,
  );
  await setStatus("bravo", "mockups", "awaiting_review", -2);

  // Charlie (en solo) / Maquettes : validé. Charlie / Cahier des charges : rien déposé alors que
  // l'échéance est passée = livrable EN RETARD.
  const cMock1 = await submit("charlie", "mockups", 1, -6, louis);
  await change(
    "charlie",
    "mockups",
    "to_submit",
    "awaiting_review",
    -6,
    louis,
    cMock1,
  );
  await change(
    "charlie",
    "mockups",
    "awaiting_review",
    "approved",
    -4,
    teacherId,
    cMock1,
  );
  await setStatus("charlie", "mockups", "approved", -4, true);

  // Notifications (une envoyée, une en attente, une in_app non lue), pour la phase 7.
  await db.insert(s.notifications).values([
    {
      userId: teacherId,
      type: "submission_received",
      channel: "email",
      payload: { assignmentId: assignmentId("bravo", "mockups") },
      attemptCount: 1,
      createdAt: at(-2),
      sentAt: at(-2),
    },
    {
      userId: noah,
      type: "changes_requested",
      channel: "email",
      payload: { assignmentId: assignmentId("bravo", "specs") },
      createdAt: at(-19),
    },
    {
      userId: lea,
      type: "approved",
      channel: "in_app",
      payload: { assignmentId: assignmentId("alpha", "specs") },
      createdAt: at(-18),
    },
  ]);
}
