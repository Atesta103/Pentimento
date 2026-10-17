#!/usr/bin/env bash
# Arrête proprement l'environnement de développement.
#
# Usage : ./scripts/stop.sh           arrête et supprime les conteneurs (les dépendances installées sont gardées)
#         ./scripts/stop.sh --clean   supprime aussi les volumes (node_modules, cache) et l'image : repart de zéro
set -euo pipefail

cd "$(dirname "$0")/.."

if ! command -v docker >/dev/null 2>&1 || ! docker info >/dev/null 2>&1; then
  echo "Docker ne répond pas : rien à arrêter."
  exit 0
fi

if [ "${1:-}" = "--clean" ]; then
  echo "→ Arrêt, suppression des conteneurs, des volumes et de l'image…"
  docker compose down --volumes --remove-orphans --rmi local
else
  echo "→ Arrêt et suppression des conteneurs (SIGTERM, 10 s avant arrêt forcé)…"
  docker compose down --remove-orphans --timeout 10
fi

echo "✔ Tout est arrêté."
