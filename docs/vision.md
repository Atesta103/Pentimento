# Vision

## Le problème

- Les étudiants rendent tout au dernier moment.
- Ils n'osent pas montrer un travail imparfait.
- Ils ne savent pas si leur travail va dans la bonne direction.
- Les enseignants n'ont pas de vue d'ensemble sur l'avancement des groupes.

## L'idée

Une application qui aide des étudiants (et, à terme, des équipes en entreprise) à mener un projet de A à Z, avec ou sans enseignant. À l'origine, l'idée était plus large : business plan guidé, roadmap, checklist hebdomadaire, checkpoints avec l'intervenant, bibliothèque de modèles de livrables, espace de feedback de l'enseignant. L'idée date d'un travail de groupe qui n'avait jamais été réalisé ; elle est reprise seule.

## L'hypothèse centrale

> Des enseignants donneront leurs retours dans l'application, et des étudiants agiront dessus.

C'est l'hypothèse la plus risquée : si elle est fausse, aucune autre fonction ne sauve le produit. C'est pourquoi le MVP se limite à la **boucle de feedback** : dépôt → retour → correction → validation. Roadmap, checklist et échéances existent déjà dans des outils généralistes (Notion, Trello, Teams, Moodle) et ne différencient pas le produit.

## Ce qui rend le produit différent

Il rend **les versions intermédiaires utiles, visibles et valorisantes**. Le premier jet imparfait est normal ; la correction est une étape de travail, pas un échec. C'est le sens du nom (voir `brand/naming.md`) : un *pentimento* est la correction d'un peintre, visible sous la couche finale.

Conséquences concrètes sur le produit :
- Toutes les versions sont conservées et consultables.
- Les corrections demandées sont des objets suivis (« à corriger » → « traité »), pas des commentaires perdus.
- En V2, la comparaison visuelle des versions montre ce qui a changé. La fonction qui en rend compte s'appellera « Les ratures ».

## Utilisateurs

- **Enseignant ou intervenant** : définit le projet et les livrables, reçoit les dépôts, donne le retour, valide. Besoin : savoir ce qu'il doit traiter maintenant.
- **Étudiant (en groupe)** : dépose, voit les corrections à faire, redépose. Besoin : savoir où il en est et si c'est dans la bonne direction.
- **Acheteur probable** : l'école, pas seulement l'étudiant.

## Hors périmètre du MVP

Constructeur de business plan, co-édition, répartition de tâches, checklist, checkpoints, modes « projet personnel » et « sans enseignant », administration d'école, notifications dans l'application, annotation dans le document, IA. Voir `product/v2.md`.

## Risques connus

- Besoin diffus, ressenti par tous et porté par personne.
- Produit à deux faces (étudiants et enseignants) : il ne vaut rien tant que les deux ne l'utilisent pas.
- Acheteur institutionnel : cycle de vente long.
- Concurrence de plateformes généralistes déjà installées dans les écoles.

## Comment valider

- 2 ou 3 entretiens : des étudiants et au moins un enseignant.
- Test du nom auprès de 5 étudiants, sans explication préalable.
- Maquettes des deux tableaux de bord à montrer pendant les entretiens.
