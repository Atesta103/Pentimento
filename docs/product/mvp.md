# MVP

**Règle de tri.** Une fonction entre dans le MVP seulement si, sans elle, la boucle dépôt → retour → correction ne fonctionne plus.

**Arbitrages déjà décidés.**
- Un seul mode : projet encadré en groupe. Un groupe d'une personne couvre le travail individuel.
- Pas de livrable individuel au sein d'un projet de groupe.
- Un seul enseignant par projet (le créateur).
- Un étudiant ne voit que le travail de son groupe.
- Le dépôt reste possible après la date limite : le retard est calculé et affiché.
- Au MVP, tout utilisateur vérifié peut créer un projet et en devenir enseignant. La restriction est prévue en V2.4.

## Fonctionnalités

| ID | Fonctionnalité | Dépend de | Terminé quand |
|---|---|---|---|
| MVP-01 | Inscription, connexion, vérification d'email | — | un compte se crée, se vérifie et se connecte ; un compte non vérifié ne peut ni créer ni rejoindre un projet |
| MVP-02 | Rôles enseignant et étudiant, portés par l'appartenance à un projet | MVP-01 | une même personne peut être enseignant d'un projet et étudiant d'un autre |
| MVP-03 | Créer un projet (titre, brief, objectifs, dates) | MVP-02 | l'enseignant crée, modifie et archive un projet |
| MVP-04 | Invitation par code, avec expiration | MVP-03 | un étudiant rejoint avec un code valide ; code expiré ou projet non actif refusé ; tentatives limitées |
| MVP-05 | Groupes : créer ou rejoindre | MVP-04 | un étudiant a un seul groupe par projet ; seul l'enseignant déplace quelqu'un |
| MVP-06 | Livrables : titre, consigne, date limite, ordre | MVP-03 | l'enseignant crée, modifie, réordonne ; suppression refusée s'il existe une version déposée |
| MVP-07 | Vue chronologique des livrables, en lecture seule | MVP-06 | les livrables s'affichent triés avec leurs échéances (c'est la « roadmap » simple) |
| MVP-08 | Dépôt avec versions (v1, v2…) | MVP-05, MVP-06 | dépôt par lien signé, envoi direct au bucket, confirmation vérifiée par le serveur ; une version n'est jamais modifiée |
| MVP-09 | Quatre statuts et transitions contrôlées | MVP-08 | seules les transitions de `docs/security/access-rules.md` sont acceptées ; chacune écrit `status_changes` dans la même transaction |
| MVP-10 | Commentaires sur une version, avec case « à corriger » | MVP-08 | l'enseignant commente et marque ; l'étudiant répond |
| MVP-11 | Actions de l'enseignant : « Demander des corrections » et « Valider » | MVP-09, MVP-10 | « Demander des corrections » exige au moins un commentaire « à corriger » |
| MVP-12 | Corrections côté étudiant : cocher comme traité, redéposer | MVP-10, MVP-08 | un commentaire traité garde sa date et son auteur ; la v2 repasse le livrable en attente |
| MVP-13 | Dashboard enseignant | MVP-09 | compteurs filtrables (À corriger, En retard, Corrections en cours, Validés) ; table triée par ancienneté d'attente ; ne montre que ses projets |
| MVP-14 | Dashboard étudiant | MVP-09 | blocs « À rendre bientôt », « Corrections à faire », « En attente du prof » ; ne montre que son groupe |
| MVP-15 | Emails : nouveau dépôt, corrections demandées, validation | MVP-09 | envoyés depuis `notifications`, seulement aux membres concernés |
| MVP-16 | Bibliothèque de modèles de livrables téléchargeables | MVP-06 | des fichiers fournis, sans éditeur |
| MVP-17 | Textes d'interface en fichiers de traduction (français, puis anglais) | — | aucun texte écrit en dur |
| MVP-18 | Contrôle d'accès central `assertCan` et tests de la matrice | MVP-02 | chaque ligne de la matrice a un test autorisé et un test refusé |

## À repousser en premier si le temps manque

MVP-15 (emails) et MVP-16 (bibliothèque) : sans eux, la boucle fonctionne encore.

## Dashboards : détail

**Enseignant** : question centrale « qu'est-ce que je dois traiter maintenant ? ». Compteurs en haut, table au centre (livrable, groupe, date de dépôt, échéance, statut), tri par défaut sur les dépôts en attente les plus anciens. Un clic ouvre la page du livrable : fichier, versions, commentaires, boutons « Demander des corrections » et « Valider ». Une table plutôt qu'un kanban : l'enseignant traite une file d'attente, il ne déplace pas des cartes.

**Étudiant** : trois blocs. « Corrections à faire » est celui qui apporte le plus de valeur. Chaque commentaire « à corriger » se coche une fois traité ; cela remplace la checklist hebdomadaire.
