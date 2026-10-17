# CLAUDE.md : Pentimento

Pentimento est une application web pour étudiants et enseignants : l'enseignant définit un projet et des livrables, les étudiants (en groupe) déposent des versions, l'enseignant commente, demande des corrections ou valide. Le cœur du produit est la **boucle dépôt → retour → correction → validation**.

Tout le contexte est dans `docs/`. Avant d'écrire du code, lis `BOOTSTRAP.md` (plan de démarrage par phases), puis les documents de la phase en cours.

## Règles absolues

1. **Ne fais jamais `git commit`, `git push`, ni de branche ou de pull request.** Alexandre commit lui-même. À la fin de chaque étape, liste les fichiers modifiés et propose un message de commit.
2. **N'invente rien.** Si une information manque dans `docs/` (valeur de design, règle métier, choix technique non décidé), pose la question avant de continuer.
3. **Aucun secret dans le dépôt.** Seuls les noms des variables vont dans `.env.example`.
4. **Chaque dépendance est justifiée** (pourquoi celle-ci, quelles alternatives) et sa version vérifiée dans la documentation officielle du moment, pas dans ta mémoire. Versions épinglées.
5. **Ne déclare jamais une étape terminée sans l'avoir vérifiée** : typecheck, lint, tests, et build quand c'est pertinent. Dis ce que tu as lancé et le résultat réel, y compris les échecs.
6. **Une phase à la fois.** Termine la phase en cours, arrête-toi au checkpoint, et attends la validation d'Alexandre avant la suivante.

## Accompagnement : Alexandre apprend

Alexandre est en M2 Full Stack et veut comprendre ce que tu fais. Pour tout ce qui touche au développement web :

- **Feature** : avant de coder, explique comment tu t'organises, pourquoi cet ordre (ce qui dépend de quoi), comment tu le fais, et pourquoi pas autrement.
- **Bug ou faille** : explique comment tu l'as trouvé (symptôme, hypothèse, test qui le prouve), comment tu l'as réglé, et comment l'éviter à l'avenir.
- **Choix technique** : options en quelques lignes, recommandation, raison.

Reste concis : un petit cours ciblé, pas un traité. Écris en **français** ; le code (identifiants, noms de fichiers, messages de commit proposés) est en **anglais**.

## Stack décidée (voir `docs/decisions/journal.md`, D-007)

| Domaine | Choix |
|---|---|
| Application | Next.js full-stack, TypeScript strict |
| Base de données | PostgreSQL |
| Schéma et migrations | Drizzle |
| Authentification | bibliothèque dans l'application (choix précis à comparer en phase 4) |
| Fichiers | stockage objet compatible S3, hébergé en Europe, bucket privé |
| Validation des entrées | Zod |
| Tests | Vitest (services, base), Playwright (parcours complets) |
| Hébergement | Vercel pour le moment, région européenne (`cdg1`) ; migration vers un hébergeur français possible plus tard |

Ce qui n'est **pas** décidé (à trancher avec Alexandre, voir `BOOTSTRAP.md`, phase 0) : gestionnaire de paquets, approche CSS et composants, bibliothèque d'authentification, base hébergée, service d'envoi d'emails, bibliothèque d'internationalisation.

## Architecture en 5 couches (voir `docs/architecture/architecture.md`)

1. **Présentation** : pages et composants. Jamais d'accès à la base.
2. **Entrée** : server actions et routes. Valident les entrées (Zod) et appellent un service.
3. **Services** : logique métier et contrôle d'accès (`assertCan`).
4. **Dépôts** : requêtes Drizzle, rien d'autre.
5. **Données** : schéma, migrations, énumérations.

**Chaque couche appelle seulement celle du dessous.** Cette règle est contrôlée par un test automatique (phase 1).

## Base de données (voir `docs/data/`)

- 12 tables, au pluriel, en `snake_case`. `id` uuid ; `<concept>_id` clé étrangère ; `<verbe>_by_id` auteur d'une action ; `_at` instant (`timestamptz`) ; `_on` jour (`date`) ; `needs_` booléen ; l'unité dans le nom (`size_bytes`).
- Les versions (`submissions`) et les changements de statut (`status_changes`) sont **immuables** : jamais de `UPDATE` ni de `DELETE`.
- Le statut courant (`assignments.status`) et `status_changes` s'écrivent **dans la même transaction**.
- Le retard est **calculé**, jamais stocké.
- Pas de `ON DELETE CASCADE` sur le travail des étudiants. Les projets s'archivent.

## Sécurité (voir `docs/security/access-rules.md`)

- Refus par défaut. L'autorisation se fait **côté serveur**, dans les services, via un point de contrôle unique `assertCan`.
- Le middleware de Next.js ne remplace **jamais** le contrôle d'accès. Une server action est une route publique : elle valide ses entrées et appelle un service.
- Toute ressource est chargée **à travers les projets de l'utilisateur** ; une ressource inaccessible répond « introuvable » (404), pas « interdit ».
- Fichiers : jamais transmis par le serveur (limite de 4,5 Mo des fonctions Vercel). Flux : lien signé → envoi direct au bucket → confirmation → vérification serveur (taille, type, empreinte).
- Chaque ligne de la matrice d'accès a au moins un test « autorisé » et un test « refusé ».

## Interface et design (voir `docs/brand/design-direction.md`, `design/tokens.json`)

- Utilise les jetons de design, jamais de couleur écrite en dur dans un composant.
- Jamais la couleur seule pour porter une information : chaque état a une icône de forme différente.
- Espacements, arrondis et tailles en **multiples de 4** (règle héritée du projet design-system, à confirmer avec Alexandre).
- Contrastes testés automatiquement (voir phase 2).

## Internationalisation

Français d'abord, anglais ensuite (étudiants étrangers). Aucun texte d'interface écrit en dur : tout passe par des fichiers de traduction dès la première page. Langue de l'utilisateur dans `users.locale`.

## Qualité

Avant de dire « terminé » : `typecheck`, `lint`, `test` passent (le script `check` les regroupe). Un bug corrigé reçoit un test qui l'aurait attrapé.

## Journal de décisions

Toute décision notable s'ajoute à `docs/decisions/journal.md` : contexte, options, décision, raisons, risques, à revoir quand. Propose l'entrée à Alexandre ; il l'intègre.
