# Journal de décisions : Pentimento

Entrées du 17/10/2026. Chaque décision suit le même schéma : **contexte, options, décision, raisons, risques, à revoir quand**. On n'écrit pas seulement ce qui a été fait, mais **pourquoi**, et ce qui pourrait le remettre en cause.

Lien avec la certification RNCP : à renseigner (voir « Questions ouvertes »).

---

## D-001 : Reprise de l'idée et hypothèse centrale

**Contexte.** Ancienne idée esquissée en groupe et jamais réalisée (user flow FigJam en 7 étapes, parcours étudiant et parcours enseignant), reprise seul. Problème visé : les étudiants rendent tout au dernier moment, n'osent pas montrer un travail imparfait et ne savent pas s'ils vont dans la bonne direction ; les enseignants n'ont pas de vue d'ensemble sur l'avancement.

**Options.**
- (a) Application complète « de A à Z » : business plan, roadmap, checklist, checkpoints, templates, feedback.
- (b) Réduire le MVP à la boucle de feedback : dépôt, retour, correction, validation.

**Décision.** (b) pour le MVP, (a) en vagues successives.

**Raisons.**
- L'hypothèse la plus risquée est : *des enseignants donneront leurs retours dans l'application et des étudiants agiront dessus*. Si elle est fausse, aucune autre fonction ne sauve le produit : on la teste en premier.
- Roadmap, checklist et échéances existent déjà dans des outils généralistes (Notion, Trello, Teams, Moodle) : pas de différenciation à cet endroit.

**Risques.** Besoin diffus (ressenti par tous, porté par personne) ; produit à deux faces (étudiants et enseignants) qui ne vaut rien tant que les deux ne l'utilisent pas ; acheteur probable = l'école, donc cycle de vente long.

**À revoir.** Après 2 ou 3 entretiens (étudiants et au moins un enseignant).

---

## D-002 : Nom du produit

**Contexte.** Le nom du projet d'origine ne dit rien du produit. Critères retenus : évoque le bénéfice sans décrire le produit de façon générique ; se dicte et s'épelle sans hésiter ; convient à un étudiant comme à une direction d'école ; n'enferme pas dans une fonction ; fonctionne pour des étudiants étrangers qui étudient en France ; court.

**Démarche.**
1. Une première série de propositions (plusieurs IA, sans leur donner de noms) a convergé vers la métaphore du chemin et de l'étape (Sillage, Cairn, Jalon, Cap…). Territoire jugé saturé et commun à tous les outils de gestion : abandonné.
2. Territoire retenu : la **transformation du brouillon** (matière qu'on travaille, correction visible), car c'est ce qui distingue le produit.
3. Seconde série de propositions dans ce territoire, avec interdiction de reprendre les noms déjà proposés.

**Options finalistes.** Pentimento, Rature, Patina (et Mue au départ).

**Écartés.**
- *Marge* : se confond avec la « marge » du business plan, et c'est un prénom courant.
- *Esquisse* : très utilisé comme nom d'outil, épellation difficile pour un étranger.
- *Palimpseste* : concept parfait mais impossible à dicter.
- *Patina* : plusieurs usages déjà présents dans le logiciel (recherche web), dit le « vécu » plus que le « brouillon ».
- *Rature* : valable en français seulement, et sa connotation d'erreur peut inquiéter l'acheteur (l'école).

**Décision.** **Pentimento**. « Rature » est réservé pour **nommer la fonction** « historique visible des corrections ».

**Raisons.** Sens exact (en peinture, correction du peintre visible sous la couche finale) ; aucune connotation négative à franchir ; passe en italien, en anglais et en français.

**Vérifications faites.**
- INPI : marque verbale PENTIMENTO n° 4416789, **classe 33 (vins)**, enregistrée, expiration prévue le 03/01/2028 : domaine très éloigné des classes 9 (logiciels), 41 (éducation) et 42 (SaaS).
- Recherche web : usages hors éducation (application de médiation en musée, outil de recherche en construction).

**Limites et risques.**
- Le registre consulté est français : TMview (EUIPO) et la recherche de domaines restent à faire.
- Nom de 4 syllabes, long en interface : prévoir un logo court ou un surnom d'usage.
- Sens cultivé : à tester auprès de 5 étudiants sans explication préalable.
- Avant un dépôt de marque réel : avis de l'INPI ou d'un conseil en propriété industrielle.

**À revoir.** Avant tout dépôt de marque ou lancement public.

---

## D-003 : Périmètre du MVP

**Règle de tri.** Une fonction entre dans le MVP seulement si, sans elle, la boucle dépôt → retour → correction ne fonctionne plus.

**Inclus.** Comptes et deux rôles (étudiant, enseignant) ; création de projet et invitation par code ; groupes ; livrables avec date limite ; dépôt avec versions ; 4 statuts (À rendre, En attente du prof, Corrections demandées, Validé ; le retard est calculé, pas stocké) ; commentaires avec case « à corriger » ; actions du prof (demander des corrections, valider) ; dashboards prof et étudiant ; emails de notification ; bibliothèque de modèles en fichiers téléchargeables ; vue chronologique des livrables en lecture seule.

**Exclus (renvoyés à la V2).** Constructeur de business plan, co-édition, répartition de tâches et checklist, checkpoints, modes « projet personnel » et « sans enseignant », administrateur d'école, notifications dans l'application, annotation dans le document, IA.

**Arbitrages.**
- Un seul mode : projet encadré en groupe. Un groupe d'une personne couvre le travail individuel.
- Pas de livrable individuel au sein d'un projet de groupe.
- Un seul enseignant par projet (le créateur).
- Un étudiant ne voit que le travail de son groupe.
- Textes de l'interface dans des fichiers de traduction dès le début (étudiants non francophones).
- Authentification par bibliothèque éprouvée, pas de système maison (la sécurité est le point le moins solide).

**À revoir.** Après les premiers retours d'utilisateurs.

---

## D-004 : V2 en vagues

| Vague | Contenu | Pourquoi à cette place |
|---|---|---|
| V2.1 | Comparaison visuelle des versions, notifications dans l'application, rappels, grilles de critères | Renforce la boucle déjà utilisée et réalise la promesse du nom |
| V2.2 | Tâches, checklist, checkpoints, projet personnel | Seulement si les premiers utilisateurs le demandent (terrain de Trello) |
| V2.3 | Constructeur de business plan, exemples, test de réalisme | Après avoir vu de vrais livrables, sinon on invente des modèles dans le vide |
| V2.4 | Établissement : administrateur, SSO, intégrations, facturation, restriction de création de projets | Permet de vendre à une école, à placer quand l'usage est prouvé |
| Plus tard | Entreprises, mobile, IA, interface ludique | À tester auprès des utilisateurs |

**Pourquoi pas le business plan en premier ?** C'est la différenciation, mais il ne vaut rien tant que personne n'utilise l'application pour se faire corriger : les utilisateurs d'abord, la différenciation ensuite.

---

## D-005 : Modèle de données

**Décision.** PostgreSQL, 12 tables (schéma complet et diagramme : `docs/data/erd.md`).

**Choix structurants.**
- Le statut vit sur `assignments`, car il appartient au **couple** livrable × groupe.
- Statut courant **et** journal `status_changes`, écrits dans la **même transaction**.
- Pas de table de relecture séparée : une décision du prof est un changement de statut.
- Le groupe est porté par `project_members.group_id` (une personne n'est jamais dans deux groupes du même projet).
- Les fichiers restent hors de la base (`storage_key`).
- Identifiants `uuid` ; instants en `timestamptz` (UTC).
- Versions et changements de statut **immuables** ; pas de suppression en cascade sur le travail des étudiants.
- Prévu pour la V2 sans le construire : `institution_id`, `comments.anchor`, `notifications.channel`, `users.locale`.

**Conventions de nommage.** Tables au pluriel en `snake_case` ; `id` clé primaire ; `<concept>_id` clé étrangère ; `<verbe>_by_id` auteur d'une action ; `_at` instant ; `_on` jour ; `needs_` booléen ; l'unité dans le nom (`size_bytes`) ; contraintes `uq_`, `idx_`, `fk_`.

**Correction en cours de route.** `user` et `group` sont des mots réservés de PostgreSQL : toutes les tables ont été passées au pluriel.

**Risque.** Statut courant et journal peuvent diverger : écriture transactionnelle obligatoire et tests dédiés.

**À revoir.** Au moment de choisir l'outil de migrations.

---

## D-006 : Règles d'accès

**Principe.** Refus par défaut. Cinq vérifications dans l'ordre : connecté (email vérifié pour écrire), membre du projet, rôle autorisé, bon groupe pour l'étudiant, état de la ressource compatible avec l'action.

**Règles retenues.**
- Autorisation **côté serveur** uniquement, avec un **point de contrôle unique** appelé par tous les services.
- Ressources chargées **à travers les projets de l'utilisateur** ; réponse « introuvable » plutôt que « interdit ».
- Code d'invitation : long, aléatoire, avec expiration et limitation des essais.
- Fichiers : type vérifié côté serveur, taille maximale, nom généré, stockage privé, liens signés de courte durée.
- Le dépôt reste possible après la date limite : le retard est calculé et affiché, il ne bloque pas.
- Transitions de statut limitées à une liste fermée ; « demander des corrections » exige au moins un commentaire « à corriger » ; rouvrir un livrable validé exige une note.
- Chaque ligne de la matrice rôle × action donne au moins un test « autorisé » et un test « refusé ».

**Décision ouverte assumée.** Au MVP, tout utilisateur vérifié peut créer un projet et en devenir enseignant. Raison : simplicité, cercle d'utilisateurs très restreint. Risque : inacceptable pour une école ; la restriction est prévue en V2.4.

**À revoir.** Avant le premier utilisateur extérieur à ton entourage.

---

## D-007 : Choix techniques

**Contexte.** Projet mené seul, environ 2 jours par semaine, TypeScript de bout en bout (décision antérieure du projet). Points sensibles : sécurité (point le moins solide) et données personnelles d'étudiants (RGPD).

**Décisions.**

| Domaine | Choix | Alternatives écartées |
|---|---|---|
| Application | **Next.js full-stack** (interface et serveur dans un seul projet) | React + API Node séparée |
| Schéma et migrations | **Drizzle** avec PostgreSQL | Prisma ; SQL pur |
| Authentification | **Bibliothèque dans l'application** (comptes dans notre base) | Service géré externe |
| Fichiers | **Stockage objet compatible S3, hébergé en Europe** | Cloudflare R2 / AWS S3 (région à choisir) ; disque du serveur |

**Raisons.**
- *Next.js full-stack* : une seule application à développer, déployer et sécuriser, ce qui réduit les pièces mobiles pour un projet solo. L'autorisation se fait au plus près des données, côté serveur. Une API séparée double la surface de sécurité (deux déploiements, CORS, sessions entre domaines) pour un bénéfice qui ne se justifie pas à ce stade.
- *Drizzle* : le schéma s'écrit en TypeScript très proche du SQL, avec enums, clés composites, contraintes CHECK et index déclarés dans le code, et des migrations SQL lisibles. Cela colle au modèle de D-005 (statuts, unicités composées, immuabilité) et aide à comprendre ce que fait la base.
- *Bibliothèque d'authentification* : le chiffrement des mots de passe, les sessions et la vérification d'email ne sont pas codés à la main. Les données de comptes restent dans notre PostgreSQL, sans dépendance à un tiers ni coût qui monte avec le nombre d'utilisateurs. Les tables d'authentification sont générées par la bibliothèque, pas dessinées à la main.
- *Stockage objet en Europe* : bucket privé, liens signés de courte durée, données hébergées dans l'UE. Le disque du serveur est écarté en production (sauvegardes, montée en charge).

**Règles de sécurité propres à ce choix.**
- Le middleware de Next.js ne remplace **jamais** le contrôle d'accès dans les services : une faille connue en 2025 permettait de le contourner.
- Une *server action* est un point d'entrée HTTP public : chacune valide ses données d'entrée et appelle le contrôle d'accès, comme n'importe quelle route d'API.

**Choix secondaires proposés par défaut (à confirmer).** Validation des entrées avec Zod ; internationalisation avec une bibliothèque dédiée aux textes de l'interface ; tests unitaires et d'intégration avec Vitest, parcours complets avec Playwright ; envoi des emails à partir de la table `notifications`.

**Architecture en 5 couches (confirmée).** Présentation (`app/`, aucun accès à la base) → Entrée (server actions et routes : valident les données et appellent un service) → Services (logique métier et contrôle d'accès) → Dépôts (requêtes Drizzle uniquement) → Données (schéma, migrations, énumérations). Chaque couche appelle seulement celle du dessous.

**Hébergement (provisoire).** Vercel pour le moment, avec une migration possible plus tard vers un hébergeur français. Conséquences vérifiées dans la documentation :
- Les fonctions Vercel s'exécutent **par défaut aux États-Unis** : choisir explicitement une région européenne (Paris `cdg1` ou Francfort `fra1`), et placer la base dans la même région pour la latence.
- La taille maximale d'une requête vers une fonction est de **4,5 Mo** (erreur 413 au-delà). Les fichiers des étudiants ne peuvent donc pas transiter par le serveur : **dépôt direct vers le bucket par lien signé**, puis confirmation au serveur.
- Le plan gratuit (Hobby) est réservé à un usage **personnel et non commercial** d'après les conditions d'utilisation : passer à un plan payant avant d'accueillir de vrais utilisateurs ou de vendre.
- Vercel est un fournisseur américain : point à examiner pour le RGPD avant d'héberger de vraies données d'étudiants.
- La base PostgreSQL (région européenne) reste à choisir.

**Conséquence sur le dépôt de fichiers.** Le flux devient : (1) le client demande un lien d'envoi signé, le serveur contrôle les droits et la taille annoncée ; (2) le client envoie le fichier directement au bucket ; (3) le client confirme, le serveur vérifie l'objet (taille, type, empreinte) puis crée la ligne `submissions`. Prévoir le nettoyage des fichiers envoyés mais jamais confirmés.

**Risques.** Bibliothèques jeunes qui évoluent vite (épingler les versions, lire les changements avant de mettre à jour) ; Next.js impose ses conventions et sa complexité.

**À revoir.** Après la première tranche verticale (dépôt, retour, commentaire de bout en bout).

---

## Vérifications restantes

- [ ] TMview (EUIPO) pour Pentimento, classes 9, 41, 42
- [ ] Domaines (`.fr`, `.com`, `.app`) et comptes sur les réseaux
- [ ] Test des 5 personnes sur le nom, sans explication
- [ ] 2 à 3 entretiens (étudiants et un enseignant) pour valider le besoin
- [ ] Maquettes des deux dashboards

## Questions ouvertes

- Lien exact avec la certification RNCP (projet à part, ou remplace le projet actuel ?).
- Choix de la base PostgreSQL hébergée (région européenne, proche des fonctions).
- Choix de la bibliothèque d'authentification précise (comparaison à faire avant de l'installer).
- Passage éventuel à un hébergeur français : à réévaluer avant les premiers utilisateurs réels.
