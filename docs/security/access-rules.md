# Règles d'accès

Principe : **refus par défaut**. Tout ce qui n'est pas autorisé explicitement est refusé, côté serveur uniquement. Le masquage d'un bouton dans l'interface n'est jamais une protection.

## Les 5 vérifications

Chaque action franchit, dans l'ordre :

1. **Authentifié**, et pour toute écriture, **email vérifié**.
2. **Membre du projet** concerné.
3. **Rôle** suffisant (`teacher` ou `student`).
4. **Groupe** : pour un étudiant, la ressource est celle de son groupe.
5. **État de la ressource** : projet actif, livrable dans le bon statut, etc.

Un point de contrôle unique : `assertCan(user, action, resource)`, appelé par les services. Pas de contrôle éparpillé dans les pages.

## Matrice

`E` = étudiant, `P` = enseignant du projet (le créateur), `—` = refusé.

### Projets et groupes

| Action | E | P | Conditions |
|---|---|---|---|
| Créer un projet | oui | oui | utilisateur vérifié (tout le monde au MVP ; restriction en V2.4) ; le créateur devient `teacher` |
| Voir un projet | membre | oui | membre uniquement |
| Modifier / archiver un projet | — | oui | |
| Voir le code d'invitation | — | oui | |
| Rejoindre avec un code | oui | — | code valide, non expiré, projet `active`, utilisateur vérifié, tentatives limitées |
| Créer / rejoindre un groupe | oui | oui | un seul groupe par étudiant et par projet |
| Déplacer un étudiant de groupe | — | oui | |
| Voir les groupes | son groupe | tous | un étudiant ne voit pas les autres groupes |

### Livrables

| Action | E | P | Conditions |
|---|---|---|---|
| Créer / modifier / réordonner | — | oui | |
| Supprimer | — | oui | refusé s'il existe une version déposée |
| Voir la liste et les consignes | oui | oui | membre du projet |

### Dépôts, commentaires, statuts

| Action | E | P | Conditions |
|---|---|---|---|
| Demander un lien d'envoi signé | oui | — | projet `active`, groupe de l'étudiant, taille et type annoncés acceptés |
| Confirmer un dépôt | oui | — | le serveur vérifie taille, type et empreinte ; crée la version dans une transaction |
| Voir / télécharger une version | son groupe | tous les groupes | lien de téléchargement signé, de courte durée |
| Écrire un commentaire | oui | oui | sur une version visible par l'auteur ; seul `P` peut cocher `needs_fix` |
| Répondre à un commentaire | oui | oui | |
| Marquer un commentaire traité | son groupe | oui | |
| Modifier / supprimer un commentaire | auteur | auteur | uniquement le sien, avec date de modification |
| Demander des corrections | — | oui | statut `awaiting_review`, au moins un commentaire `needs_fix` |
| Valider | — | oui | statut `awaiting_review` |
| Rouvrir un livrable validé | — | oui | note obligatoire |

### Tableaux de bord et notifications

| Action | E | P | Conditions |
|---|---|---|---|
| Dashboard enseignant | — | oui | seulement ses projets |
| Dashboard étudiant | oui | — | seulement son groupe |
| Lire ses notifications | soi | soi | uniquement les siennes |

## Transitions de statut (liste fermée)

| De | Vers | Qui | Condition |
|---|---|---|---|
| `to_submit` | `awaiting_review` | automatique | un dépôt est confirmé |
| `awaiting_review` | `changes_requested` | enseignant | au moins un commentaire `needs_fix` |
| `awaiting_review` | `approved` | enseignant | |
| `changes_requested` | `awaiting_review` | automatique | une nouvelle version est confirmée |
| `approved` | `changes_requested` | enseignant | note obligatoire |

Toute autre transition est refusée. Chaque transition écrit `assignments.status` et une ligne `status_changes` **dans la même transaction**.

**Dépôt tardif** : autorisé. Il est marqué en retard, jamais refusé.

## Règles transversales

- **Charger à travers les projets de l'utilisateur.** Une requête cherche toujours « cette ressource parmi celles auxquelles j'ai droit », jamais « cette ressource » puis « ai-je le droit ? ». Cela empêche qu'un identifiant deviné ouvre la porte (IDOR).
- **404, pas 403**, pour une ressource inaccessible : ne pas révéler son existence.
- **Server actions = routes publiques.** Chacune valide ses entrées (Zod) et appelle un service ; aucune n'a confiance en ce que le client envoie (rôle, groupe, identifiant d'auteur viennent de la session, jamais du formulaire).
- **Le middleware ne remplace jamais le contrôle.** Il peut rediriger vers la connexion ; l'autorisation vit dans les services (faille de contournement de middleware Next.js documentée en 2025).
- **Code d'invitation** : long, aléatoire, expirant, révocable, tentatives limitées par utilisateur et par adresse.
- **Fichiers** : bucket privé, liens signés courts, validation de la taille et du type côté serveur après envoi, empreinte SHA-256, nettoyage des envois jamais confirmés. Nom d'origine jamais utilisé comme chemin (`storage_key` généré).
- **Texte saisi** : jamais interprété comme HTML (échappement par défaut, pas de rendu brut).
- **Limitation de débit** sur connexion, inscription, code d'invitation, demande de lien signé.
- **Journal** : les décisions d'accès sensibles (refus répétés, validation, réouverture) laissent une trace sans donnée personnelle superflue.

## Tests de la matrice

Pour **chaque ligne** : au moins un test « autorisé » et un test « refusé ». Cas obligatoires en plus :
un étudiant d'un autre groupe ; un enseignant d'un autre projet ; un utilisateur non vérifié ; un projet `archived` ; un code expiré ; un identifiant d'une ressource existante mais inaccessible (attendu : 404) ; une transition hors liste.
