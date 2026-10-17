# Parcours utilisateur

Source : le board FigJam d'origine « Les endives » (idée esquissée en groupe, jamais réalisée).
Lien : https://www.figma.com/board/azKZkKvTRWE6oFgj7qAsKO/Les-endives

Le board contient deux couloirs : **parcours étudiant (projet en groupe)** et **parcours enseignant**. Couleurs des post-its : jaune = actions communes, violet = projet personnel, bleu = suivi et retours, vert = étape terminée.

Trois modes existent dans le board : projet encadré, projet personnel, groupe sans enseignant. **Le MVP ne garde que le projet encadré en groupe.**

## Les 7 étapes et leur statut

| # | Étape | Ce que fait l'étudiant | Statut |
|---|---|---|---|
| 1 | Accéder au projet | Crée un compte ou se connecte ; rejoint un projet par invitation ou code ; rejoint son groupe ; accède à l'espace partagé | **MVP** (la branche « projet personnel » est en V2.2) |
| 2 | Comprendre le brief | Lit le brief, les objectifs, les livrables et dates limites ; consulte exemples et corrigés ; clarifie avec l'enseignant | **MVP** pour le brief, les objectifs et les livrables ; exemples et corrigés en V2.3 |
| 3 | Organiser le groupe | Consulte la roadmap ; répartit les tâches ; fixe des échéances internes ; checklist hebdomadaire ; checkpoints avec l'intervenant ; met à jour l'avancement | **MVP** : roadmap en lecture seule seulement. Le reste en V2.2 |
| 4 | Construire le business plan | Choisit un modèle ; décrit besoin, cible, solution ; étudie le marché ; chiffre ; justifie les hypothèses ; teste le réalisme | **MVP** : modèles téléchargeables seulement. Le constructeur guidé en V2.3 |
| 5 | Soumettre un livrable | Sélectionne le livrable ; vérifie consignes et échéance ; dépose la version ; confirme le dépôt et consulte son statut | **MVP** |
| 6 | Corriger et progresser | Consulte les commentaires ; repère les corrections ; répartit les corrections ; corrige et redépose | **MVP** (la répartition des corrections dans le groupe est simple : un groupe se coordonne lui-même) |
| 7 | Finaliser le projet | Vérifie que tout est complet ; relit la cohérence ; dépose le dossier final ; consulte le dernier retour ; fait le bilan | **MVP** : statut « Validé » par livrable. Dossier final et bilan en V2.4 |

## Parcours enseignant (points de contact du board)

| Moment | Action de l'enseignant | Statut |
|---|---|---|
| Création | Crée le projet, le brief, les livrables et dates limites, partage le code | MVP |
| Clarification | Répond aux questions des élèves sur les consignes | MVP via commentaires ; échanges libres en V2 |
| Checkpoints | Propose ou accepte un rendez-vous, valide la liste de tâches | V2.2 |
| Dépôt reçu | Consulte « En attente de retour » (où ? dashboard ou onglet : **dashboard**) | MVP |
| Retour | Corrige et commente le livrable, demande des corrections | MVP |
| Suivi | Voit « En attente de retour de l'étudiant » | MVP |
| Clôture | Fait un retour final, choisit le statut « Terminé » ; l'étudiant reçoit une alerte | MVP (statut « Validé » + email) |

## Questions du board maintenant tranchées

- *« Je consulte (où ?) le statut “En attente de retour” »* → dans le **dashboard** de l'enseignant (table filtrable).
- *« Je consulte mes rdv checkpoint (dashboard ? onglet feedback ?) »* → hors MVP.
- *« Je valide la liste des tâches que l'élève identifie ? »* → hors MVP (V2.2).

## Statuts du livrable (simplifiés par rapport au board)

Le board employait trois noms proches (« En attente de retour », « En attente de retour de l'étudiant », « En attente de validation »). Ils sont ramenés à quatre :

`to_submit` (À rendre) → `awaiting_review` (En attente du prof) → `changes_requested` (Corrections demandées) → `approved` (Validé).

Le **retard** n'est pas un statut : il est calculé (échéance dépassée et statut différent de `approved`).
