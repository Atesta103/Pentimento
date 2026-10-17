# Notes de schéma

Complète `erd.md` (les tables et relations) avec ce que le diagramme ne montre pas. Ce fichier est la référence pour écrire le schéma Drizzle (phase 3).

## Conventions de nommage

| Cas | Règle | Exemple |
|---|---|---|
| Table | pluriel, `snake_case` (évite les mots réservés `user`, `group`) | `project_members` |
| Clé primaire | `id`, uuid | `id` |
| Clé étrangère | `<concept>_id` | `project_id` |
| Auteur d'une action | `<verbe>_by_id` | `approved_by_id` |
| Instant | `_at`, `timestamptz` (UTC) | `due_at` |
| Jour | `_on`, `date` | `starts_on` |
| Booléen | préfixe `needs_` | `needs_fix` |
| Unité | dans le nom | `size_bytes` |
| Empreinte | `checksum_sha256` | |
| Ordre d'affichage | `sort_order` | |
| Contraintes | `uq_`, `idx_`, `fk_`, `ck_` + table + colonnes | `uq_assignments_deliverable_id_group_id` |
| Énumérations | `<concept>_<champ>` | `assignment_status` |
| Résolution | `resolved_at` nullable plutôt qu'un booléen `is_resolved` | |

## Principes

- **Immuables** : `submissions` et `status_changes` n'ont pas de `updated_at` et ne reçoivent ni `UPDATE` ni `DELETE`.
- **Statut courant** stocké dans `assignments.status`, **journal** dans `status_changes`, écrits dans la **même transaction**. Le statut courant sert à lire vite, le journal à comprendre et à compter.
- **Retard calculé**, jamais stocké : `due_at < now()` et statut ≠ `approved` (ou, pour un dépôt, `submitted_at > due_at`).
- **Pas de `ON DELETE CASCADE`** sur le travail des étudiants (`assignments`, `submissions`, `comments`, `status_changes`). Suppression d'un livrable refusée si un dépôt existe ; les projets s'archivent.
- **Fichiers hors base** : seules les références (`storage_key`, nom d'origine, type, taille, empreinte) sont en base.
- **Uuid** partout, pour ne rien deviner par énumération d'URL.

## Unicités composées

| Table | Colonnes | Rôle |
|---|---|---|
| `project_members` | `project_id`, `user_id` | une personne n'est membre qu'une fois d'un projet |
| `assignments` | `deliverable_id`, `group_id` | un livrable est assigné une fois à un groupe |
| `submissions` | `assignment_id`, `version_number` | pas de deux « v2 » |

Aussi : `users.email` unique (insensible à la casse : stocker en minuscules), `projects.invite_code` unique, `institutions.slug` unique.

## Cohérence entre tables : la clé composite

**Problème.** `project_members.group_id` pointe vers un groupe, mais rien n'empêche que ce groupe appartienne à un *autre* projet que `project_members.project_id`.

**Solution retenue.** Ajouter une unicité `unique(groups.project_id, groups.id)` puis une clé étrangère composite `(project_id, group_id)` → `groups(project_id, id)` dans `project_members`. La base garantit alors la règle elle-même. **Pourquoi pas autrement :** un contrôle dans le service ne protège pas contre un script, une migration ou un oubli ; la base est la dernière ligne de défense. Même schéma pour `assignments` (le groupe et le livrable doivent être du même projet) : voir en phase 3 si une colonne `project_id` redondante sur `assignments` est justifiée, et le noter dans le journal.

## Contraintes `CHECK`

| Table | Règle |
|---|---|
| `submissions` | `version_number >= 1`, `size_bytes > 0` |
| `projects` | `ends_on >= starts_on` |
| `assignments` | `approved_at` et `approved_by_id` tous deux renseignés ou tous deux nuls ; renseignés seulement si `status = 'approved'` |
| `comments` | `resolved_at` et `resolved_by_id` tous deux renseignés ou tous deux nuls |
| `status_changes` | `from_status <> to_status` |
| `notifications` | `attempt_count >= 0` |

## Déclencheurs (triggers) d'immuabilité

`submissions` et `status_changes` : un trigger `BEFORE UPDATE OR DELETE` qui lève une exception. **Pourquoi :** la règle « jamais d'UPDATE » ne doit pas dépendre de la discipline du code. Un test de base tente un `UPDATE` et un `DELETE` et attend l'échec.

## Index à prévoir

| Index | Pour |
|---|---|
| `assignments(status)` ou `(group_id, status)` | dashboards |
| `assignments(last_activity_at)` | tri « le plus ancien en attente » |
| `deliverables(project_id, sort_order)` | chronologie |
| `submissions(assignment_id, version_number desc)` | dernière version |
| `comments(submission_id)` | page d'un livrable |
| `status_changes(assignment_id, changed_at)` | historique |
| `notifications(user_id, sent_at)` | file d'envoi et boîte de réception |
| `project_members(user_id)` | « mes projets » (chargement à travers les projets de l'utilisateur) |

Les clés étrangères ne sont pas indexées automatiquement par PostgreSQL : chaque clé utilisée en jointure fréquente reçoit un index.

## Liaison avec l'authentification

La bibliothèque d'authentification (phase 4) apporte ses propres tables (sessions, comptes, vérifications). Deux options à comparer à ce moment-là : (a) la table `users` du projet *est* la table utilisateur de la bibliothèque, étendue de nos champs ; (b) table séparée liée par un identifiant. Décision à noter au journal. L'`email_verified_at` du schéma doit rester cohérent avec ce que la bibliothèque appelle « email vérifié ».

## Données de démonstration (seed)

Un jeu reproductible qui permet de voir chaque écran dans chaque état :

- 1 établissement, 1 enseignant, 6 étudiants.
- 1 projet actif avec 3 groupes (dont un d'une personne) et 4 livrables.
- Les **4 statuts** représentés : au moins une affectation `to_submit`, une `awaiting_review`, une `changes_requested` (avec commentaires `needs_fix`, dont un résolu), une `approved`.
- Un livrable **en retard**, un dépôt **tardif**, un livrable avec **3 versions**.
- Un projet `draft` et un `archived`, pour tester les refus.
- Des mots de passe de démonstration réservés à l'environnement local.

## Tests de base

Contraintes violées volontairement (unicités, `CHECK`, clé composite), triggers d'immuabilité, transaction statut + journal (rollback si l'un échoue), migration sur base vide.
