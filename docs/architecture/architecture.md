# Architecture

Choix détaillés et raisons : `docs/decisions/journal.md`, D-007.

## Stack

| Domaine | Choix | Statut |
|---|---|---|
| Application | Next.js full-stack, TypeScript strict | décidé |
| Base | PostgreSQL | décidé |
| Schéma / migrations | Drizzle | décidé |
| Authentification | bibliothèque dans l'application | famille décidée, outil à comparer (phase 4) |
| Fichiers | stockage objet compatible S3, Europe, bucket privé, liens signés | décidé ; fournisseur à choisir |
| Validation | Zod | décidé |
| Tests | Vitest + Playwright | décidé |
| Hébergement | Vercel, région `cdg1` (ou `fra1`), base dans la même région | décidé pour l'instant ; hébergeur français possible plus tard |
| Emails, i18n, CSS/composants, gestionnaire de paquets, hébergeur de base | | à décider en phase 0 |

## Les 5 couches

| # | Couche | Contient | Peut appeler | Ne doit jamais |
|---|---|---|---|---|
| 1 | Présentation | pages, composants | Entrée | accéder à la base ou aux dépôts |
| 2 | Entrée | server actions, routes API | Services | contenir de la logique métier ; faire confiance aux entrées |
| 3 | Services | logique métier, `assertCan`, transactions | Dépôts, (stockage, emails) | construire des requêtes SQL |
| 4 | Dépôts | requêtes Drizzle | Données | décider d'une règle métier |
| 5 | Données | schéma, migrations, énumérations | — | |

**Pourquoi cinq couches.** Chaque couche a une raison de changer : l'interface change souvent, les règles métier moins, les requêtes quand le schéma bouge. Les séparer permet de tester les règles sans interface ni base réelle, et d'avoir un seul endroit où l'autorisation est appliquée (les services). **Pourquoi pas moins :** sans couche Services, la logique d'accès se retrouve copiée dans chaque action, et un oubli devient une faille. **Risque :** trop de cérémonie pour un petit projet ; garder des fonctions simples, sans classes ni abstractions inutiles.

**Contrôle automatique** : un test d'architecture (phase 1) échoue si un fichier importe une couche qui n'est pas juste en dessous. Vérifier qu'il échoue bien en ajoutant volontairement un import interdit.

## Arborescence cible

```
src/
  app/                    # Présentation + Entrée (routes Next.js)
    [locale]/
      (auth)/             # connexion, inscription, vérification
      (app)/              # espace connecté
        dashboard/
        projects/[projectId]/...
    api/                  # routes d'envoi de fichiers, webhooks éventuels
  components/             # composants d'interface, aucun accès aux données
    ui/                   # composants de base (boutons, bannières, champs)
  server/
    actions/              # couche Entrée : server actions
    services/             # couche Services
    access/               # assertCan, matrice
    repositories/         # couche Dépôts
    db/                   # couche Données : schema/, migrations/, client
    auth/                 # configuration de l'authentification
    storage/              # client S3, liens signés
    mail/                 # envoi d'emails et modèles
  lib/                    # utilitaires purs (dates, retard, formats)
  i18n/
    messages/
      fr.json
      en.json
design/
  tokens.json             # source des jetons, génère le CSS
tests/
  unit/  integration/  e2e/  architecture/  a11y/
docs/
```

L'arborescence est un point de départ : la phase 1 la confirme avec Alexandre.

## Flux d'envoi d'un fichier (pourquoi il ne passe pas par le serveur)

Les fonctions Vercel refusent un corps de requête supérieur à **4,5 Mo** (erreur 413). Un livrable étudiant dépasse vite cette taille. Donc :

1. **Demande** : le navigateur annonce nom, type, taille. Le serveur vérifie les droits (`assertCan`), refuse ce qui est hors limites, génère une `storage_key` et renvoie un **lien d'envoi signé**, de courte durée.
2. **Envoi** : le navigateur envoie le fichier **directement au bucket**.
3. **Confirmation** : le navigateur prévient le serveur. Celui-ci **relit** l'objet (taille, type réel, empreinte SHA-256), puis, dans **une transaction**, crée la ligne `submissions` (version suivante), met à jour `assignments.status` et écrit `status_changes`.
4. **Nettoyage** : une tâche périodique supprime les objets jamais confirmés.

**Pourquoi pas autrement.** Passer par le serveur plafonne la taille et coûte du temps de calcul. Faire confiance à la taille annoncée par le navigateur permettrait de déposer n'importe quoi : la vérification après coup est indispensable. Si l'hébergeur change plus tard, ce flux reste valable (il ne dépend que du stockage).

## Notes Vercel

- Région par défaut des fonctions : Washington (`iad1`). La **changer** vers `cdg1` ou `fra1`, et placer la base dans la même région, sinon chaque requête traverse l'Atlantique.
- Le plan gratuit (Hobby) est réservé à un usage personnel et non commercial : à revoir avant tout usage avec de vrais établissements.
- Vercel est un prestataire américain : point à examiner pour le RGPD (clauses, localisation des données, registre des sous-traitants) avant le lancement. Les données restent en Europe (base, bucket), mais la question du sous-traitant demeure.
- Le middleware n'est pas une barrière de sécurité (voir `docs/security/access-rules.md`).

## Variables d'environnement (noms seulement, jamais de valeurs dans le dépôt)

| Variable | Rôle |
|---|---|
| `DATABASE_URL` | connexion PostgreSQL |
| `AUTH_SECRET` | secret de signature des sessions (le nom exact dépend de la bibliothèque) |
| `APP_URL` | URL publique (liens dans les emails) |
| `S3_ENDPOINT` | point d'accès du stockage |
| `S3_REGION` | région du bucket |
| `S3_BUCKET` | nom du bucket privé |
| `S3_ACCESS_KEY_ID` | identifiant d'accès |
| `S3_SECRET_ACCESS_KEY` | secret d'accès |
| `MAIL_API_KEY` | clé du service d'emails (nom dépendant du service) |
| `MAIL_FROM` | adresse d'expédition |
| `CRON_SECRET` | protège les tâches périodiques (nettoyage, rappels, envoi des notifications) |

Un `.env.example` liste ces noms, sans valeurs. Un module charge et **valide** les variables au démarrage (Zod) : l'application refuse de démarrer s'il en manque.

## Stratégie de tests

| Niveau | Outil | Ce qu'il prouve |
|---|---|---|
| Unitaire | Vitest | fonctions pures (retard, transitions de statut) |
| Services + base | Vitest, vraie base PostgreSQL de test | règles métier, matrice d'accès, transactions |
| Base | Vitest | contraintes, triggers d'immuabilité, migration sur base vide |
| Architecture | Vitest | aucune couche n'appelle ailleurs que celle du dessous |
| Contraste | Vitest | les 16 vérifications ≥ 4,5 calculées avec la formule WCAG |
| Parcours | Playwright | la boucle complète dépôt → retour → correction → validation, dans un vrai navigateur |
| Accessibilité | Playwright + axe | pas de régression sur les écrans clés ; navigation clavier |

**Pourquoi une vraie base pour les tests de services** : les règles importantes vivent aussi dans la base (contraintes, triggers). Les tester contre une simulation ne prouverait rien sur elles.

## Qualité continue

Script `check` = typecheck + lint + tests. Intégration continue qui l'exécute à chaque envoi (phase 8). Un bug corrigé reçoit un test qui l'aurait attrapé.
