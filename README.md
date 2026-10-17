# Pentimento

Application web pour étudiants et enseignants : l'enseignant définit un projet et des livrables, les étudiants (en groupe) déposent des versions, l'enseignant commente, demande des corrections ou valide. Contexte complet dans [docs/](docs/) ; règles de travail dans [CLAUDE.md](CLAUDE.md) ; plan de démarrage dans [BOOTSTRAP.md](BOOTSTRAP.md).

## Prérequis

- Node.js 24 ou plus (`node -v`)
- pnpm 12, via corepack. La version est épinglée dans `package.json` (`packageManager`).
  - `corepack enable` (peut demander les droits d'écriture sur `/usr/local/bin`), puis `pnpm -v`.
  - Sans cela : préfixer chaque commande par `corepack`, par exemple `corepack pnpm install`.
- Docker Desktop (pour l'environnement de développement conteneurisé, voir ci-dessous).

## Démarrer

### Avec Docker (recommandé)

```bash
./scripts/dev.sh           # installe et lance, puis attend que http://localhost:3000 réponde
./scripts/dev.sh --logs    # idem, et reste attaché aux logs
./scripts/stop.sh          # arrête et supprime les conteneurs (garde les dépendances installées)
./scripts/stop.sh --clean  # repart de zéro : supprime aussi volumes et image
```

Le code du dépôt est **monté** dans le conteneur : tout fichier modifié sur ta machine met la page à jour en environ 1 seconde, sans reconstruction. `node_modules` et `.next` vivent dans des volumes Docker (leurs binaires sont pour Linux, ceux de macOS ne marcheraient pas). Pour lancer une commande dans le conteneur : `docker compose exec app pnpm check`.

`dev.sh` crée `.env.local` depuis `.env.example` s'il n'existe pas. PostgreSQL et le stockage S3 local seront ajoutés à `compose.yaml` aux phases 3 et 6.

### Sans Docker

```bash
pnpm install
pnpm dev          # http://localhost:3000 → redirige vers /fr
```

## Commandes

| Commande         | Rôle                                                              |
| ---------------- | ----------------------------------------------------------------- |
| `pnpm dev`       | serveur de développement                                          |
| `pnpm build`     | build de production                                               |
| `pnpm check`     | **typecheck + lint + tests** : à passer avant de dire « terminé » |
| `pnpm typecheck` | TypeScript strict, sans émission                                  |
| `pnpm lint`      | ESLint (règles Next.js + TypeScript)                              |
| `pnpm format`    | Prettier (écrit) ; `pnpm format:check` vérifie seulement          |
| `pnpm test`      | Vitest (tests unitaires et d'architecture)                        |
| `pnpm test:e2e`  | Playwright (aucun scénario avant la phase 6)                      |

Playwright demande de télécharger ses navigateurs une première fois : `pnpm exec playwright install`.

## Structure

```
src/
  app/[locale]/       présentation (pages) ; routes Next.js
  components/ui/      composants de base, aucun accès aux données
  server/
    actions/          couche Entrée (server actions)
    services/         couche Services (logique métier)
    access/           assertCan et matrice d'accès
    repositories/     couche Dépôts (requêtes Drizzle)
    db/               couche Données (schéma, migrations, client)
    auth/ storage/ mail/
  lib/                utilitaires purs, sans dépendance vers une couche
  i18n/               routage des langues et messages/fr.json, en.json
  proxy.ts            redirection de langue (jamais une barrière de sécurité)
tests/
  unit/  architecture/  integration/  e2e/  a11y/
```

## Architecture en 5 couches

Présentation → Entrée → Services → Dépôts → Données. **Chaque couche n'importe que celle du dessous.** Le test [tests/architecture/layers.test.ts](tests/architecture/layers.test.ts) le vérifie à chaque `pnpm check` ; il s'appuie sur des exemples valide et fautif dans `tests/architecture/fixtures/`.

## Langues

Aucun texte d'interface en dur : tout passe par [src/i18n/messages](src/i18n/messages). Un test garantit que `fr.json` et `en.json` ont les mêmes clés.

## Dépendances

Versions **exactes** (pas de `^`). pnpm bloque par défaut les scripts d'installation et les versions trop récentes : les exceptions sont déclarées dans `pnpm-workspace.yaml`. TypeScript est épinglé en 6.0.x tant que typescript-eslint ne supporte pas la 7.

## Variables d'environnement

Copier `.env.example` en `.env.local`. Seuls les noms sont versionnés, jamais les valeurs.
