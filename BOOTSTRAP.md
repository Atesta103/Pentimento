# BOOTSTRAP : transformer ce kit en début de projet

Ce fichier est le plan de démarrage de Pentimento, en **phases**. Règles de fonctionnement (rappel de `CLAUDE.md`) : une phase à la fois, arrêt au checkpoint, aucun commit de ta part, vérification réelle avant de dire « terminé », explications pédagogiques.

Chaque phase contient : un **objectif**, des **tâches**, des **critères d'acceptation** (ce qui doit être vrai pour dire « fini »), et un **checkpoint** (ce que tu rends à Alexandre).

---

## Phase 0 : lecture, restitution et décisions (aucun code)

**Objectif.** Vérifier que tu as tout compris et décider ce qui est encore ouvert.

**Tâches.**
1. Lis `CLAUDE.md`, puis tout `docs/` (dans l'ordre : `vision.md`, `brand/`, `product/`, `data/`, `security/`, `architecture/`, `decisions/journal.md`) et `design/tokens.json`.
2. Restitue en 15 lignes maximum ce que tu as compris du produit et de la stack.
3. Liste les contradictions, les trous et les risques que tu vois (par exemple une valeur de design manquante, une règle ambiguë).
4. Pose les questions de la section « Décisions à prendre » ci-dessous, **par groupes de 3 ou 4 maximum**, avec options, recommandation et raison.

**Décisions à prendre avec Alexandre.**

| Sujet | À trancher |
|---|---|
| Gestionnaire de paquets | npm, pnpm, autre |
| CSS et composants | Tailwind, CSS Modules, bibliothèque de composants ou non |
| Authentification | comparer 2 ou 3 bibliothèques (maintenance active, compatibilité Next.js et Drizzle, vérification d'email, gestion des sessions, coût) |
| Base de données | locale (Docker ?) et hébergée en Europe, proche de `cdg1` |
| Stockage de fichiers en dev | émulateur local compatible S3 ou bucket de test européen |
| Emails | service d'envoi ; en développement, afficher dans la console |
| Internationalisation | bibliothèque pour les textes de l'interface |
| Contrôle des couches | outil qui empêche les imports interdits (ESLint ou analyseur de dépendances) |

**Critère d'acceptation.** Alexandre a validé ta restitution et répondu aux décisions. Tu notes ses choix (propose les entrées de journal).

**Checkpoint.** Restitution + décisions prises.

---

## Phase 1 : squelette du projet

**Objectif.** Un projet qui démarre, avec la structure en couches et les garde-fous en place avant le moindre code métier.

**Tâches.**
1. Initialise Next.js en TypeScript strict avec l'organisation de dossiers de `docs/architecture/architecture.md`.
2. Lint et format ; Vitest ; configuration de Playwright (sans scénario pour l'instant).
3. Internationalisation : infrastructure et fichier de textes français, avec une page d'accueil qui l'utilise.
4. Script `check` qui lance typecheck, lint et tests.
5. **Test d'architecture** : une couche n'importe que celle du dessous.
6. `.env.example` (noms uniquement), `.gitignore`, et un `README` technique du dépôt (installation, commandes).

**Critères d'acceptation.**
- `check` passe.
- La page d'accueil s'affiche, ses textes viennent des fichiers de traduction.
- Le test d'architecture est **prouvé** : tu ajoutes volontairement un import interdit (la présentation qui importe un dépôt), tu montres que le test échoue, puis tu le retires.

**Checkpoint.** Liste des fichiers créés + message de commit proposé.

---

## Phase 2 : jetons de design et composants de base

**Objectif.** Traduire la direction artistique en jetons et en quelques composants, avec des contrastes vérifiés.

**Tâches.**
1. Transforme `design/tokens.json` en variables CSS.
2. **Ne complète pas les valeurs manquantes toi-même** (fond, typographie, logo, échelle d'espacement) : pose la question, ou utilise une valeur provisoire clairement nommée `TODO` et signale-la.
3. Composants : bouton (action, danger, désactivé), bandeau d'état (erreur, succès, attention, info) avec icône de forme différente par état, champ de saisie, anneau de focus en deux temps.
4. **Test de contraste automatique** : les 16 vérifications décrites dans `docs/brand/design-direction.md`.
5. Page de démonstration réservée au développement.

**Critères d'acceptation.**
- Le test de contraste passe (4 vérifications × 4 états).
- Aucun composant n'écrit de couleur en dur.
- Le focus est visible au clavier.

**Checkpoint.** Capture ou description de la page de démonstration + liste des valeurs encore provisoires.

---

## Phase 3 : base de données

**Objectif.** Le schéma des 12 tables, avec les contraintes qui empêchent les données absurdes.

**Tâches.**
1. Base PostgreSQL locale pour le développement.
2. Schéma Drizzle d'après `docs/data/erd.md` et `docs/data/schema-notes.md` : tables, énumérations, clés étrangères, unicités composées, contraintes `CHECK`, index.
3. **Triggers d'immutabilité** sur `submissions` et `status_changes` (voir `schema-notes.md`).
4. Migrations générées et relues.
5. Données de test (seed) décrites dans `schema-notes.md`.
6. Tests de base de données.

**Critères d'acceptation.**
- Une base vide migre sans erreur.
- Les tests prouvent que ces cas sont **refusés** : doublon (`project_id`, `user_id`) ; `UPDATE` ou `DELETE` sur `submissions` ; un `group_id` appartenant à un autre projet ; une valeur d'énumération inexistante.
- Le seed charge et permet de voir des livrables dans chacun des 4 statuts.

**Checkpoint.** Schéma commenté table par table : pourquoi chaque contrainte est là.

---

## Phase 4 : authentification

**Objectif.** Inscription, vérification d'email, connexion, déconnexion.

**Tâches.**
1. Présente le comparatif de bibliothèques (déjà demandé en phase 0) et attends le choix.
2. Intègre la bibliothèque retenue ; décide avec Alexandre comment relier ses tables d'authentification à `users` **sans dupliquer** un même fait à deux endroits.
3. Vérification d'email (affichée dans la console en développement).
4. Protection des pages **en plus** du contrôle des services, jamais à la place.

**Critères d'acceptation.** Inscription, vérification, connexion et déconnexion fonctionnent ; un compte non vérifié ne peut ni créer ni rejoindre un projet ; tests associés.

**Checkpoint.** Schéma des tables ajoutées par la bibliothèque + décision de journal.

---

## Phase 5 : services et règles d'accès

**Objectif.** La logique métier et le contrôle d'accès, testés avant toute interface riche.

**Tâches.**
1. `assertCan(user, action, ressource)` : le point de contrôle unique, d'après `docs/security/access-rules.md`.
2. Services : projets, groupes, livrables, dépôts, commentaires, statuts.
3. Politique « introuvable plutôt qu'interdit » ; chargement des ressources à travers les projets de l'utilisateur.
4. Transitions de statut dans une transaction avec l'écriture de `status_changes`.
5. Tests : un cas autorisé et un cas refusé par ligne de la matrice.

**Critères d'acceptation.**
- Chaque ligne de la matrice est couverte.
- Une transition illégale est rejetée.
- Test d'atomicité : si l'écriture de `status_changes` échoue, le statut ne change pas.
- Un étudiant ne lit jamais les données d'un autre groupe.

**Checkpoint.** Matrice annotée avec le nom du test correspondant à chaque ligne.

---

## Phase 6 : tranche verticale, la boucle complète

**Objectif.** Faire fonctionner de bout en bout la boucle qui est le cœur du produit.

**Parcours à rendre possible.** Un enseignant crée un projet → partage le code → un étudiant le rejoint → crée ou rejoint un groupe → l'enseignant crée un livrable → l'étudiant dépose une version (lien signé, envoi direct, confirmation) → l'enseignant commente avec « à corriger » → demande des corrections → l'étudiant coche, redépose la v2 → l'enseignant valide.

**Critères d'acceptation.**
- Un scénario Playwright couvre tout le parcours.
- Aucun fichier ne transite par le serveur de l'application.
- Les fichiers envoyés mais jamais confirmés peuvent être repérés et nettoyés.
- Les statuts affichés restent cohérents avec `status_changes`.

**Checkpoint.** Démonstration du parcours + liste des écarts avec `docs/product/mvp.md`.

---

## Phase 7 : tableaux de bord, emails, bibliothèque

**Tâches.** Dashboard enseignant (compteurs filtrables et table triée par ancienneté d'attente) ; dashboard étudiant (à rendre bientôt, corrections à faire, en attente) ; emails (nouveau dépôt, corrections demandées, validation) à partir de `notifications` ; bibliothèque de modèles téléchargeables.

**Critères d'acceptation.** Les dashboards n'affichent que ce que l'utilisateur a le droit de voir (tests) ; l'enseignant n'est pas noyé : tri par défaut sur les plus anciens en attente ; les emails partent seulement aux membres concernés.

---

## Phase 8 : anglais, intégration continue, déploiement

**Tâches.** Traduction anglaise complète ; pipeline qui lance `check` à chaque poussée ; déploiement Vercel en région européenne ; **liste de contrôle avant les premiers utilisateurs** : plan payant (le plan gratuit est réservé à un usage non commercial), région européenne vérifiée, sauvegardes de la base, politique de confidentialité, examen RGPD (fournisseur américain).

**Critères d'acceptation.** Le parcours complet marche en français et en anglais ; la production utilise la région européenne.

---

## Après le MVP

Voir `docs/product/v2.md` : V2.1 (comparaison de versions, notifications dans l'application, rappels, grilles de critères) d'abord, puis les vagues suivantes selon les retours des premiers utilisateurs.
