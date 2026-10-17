#!/usr/bin/env bash
# Installe (si besoin) et lance l'environnement de développement dans Docker.
# Hot reload : le code du dépôt est monté dans le conteneur, aucune reconstruction
# n'est nécessaire quand tu modifies un fichier.
#
# Usage : ./scripts/dev.sh [--logs]   (--logs : reste attaché aux logs, Ctrl+C ne stoppe pas l'app)
set -euo pipefail

cd "$(dirname "$0")/.."

URL="http://localhost:3000"
TIMEOUT_SECONDS=240

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker n'est pas installé. Installe Docker Desktop : https://www.docker.com/products/docker-desktop/" >&2
  exit 1
fi

if ! docker info >/dev/null 2>&1; then
  echo "Docker est installé mais ne répond pas. Lance Docker Desktop, attends qu'il soit prêt, puis relance ce script." >&2
  exit 1
fi

if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "→ .env.local créé depuis .env.example (valeurs vides, à remplir quand une phase en aura besoin)."
fi

# Renseigne une variable de .env.local seulement si elle est vide ou absente.
set_if_empty() {
  local key="$1" value="$2"
  if grep -qE "^${key}=.+" .env.local; then return; fi
  if grep -q "^${key}=" .env.local; then
    sed -i.bak "s|^${key}=.*|${key}=${value}|" .env.local && rm -f .env.local.bak
  else
    echo "${key}=${value}" >> .env.local
  fi
}

# Base locale : mot de passe aléatoire, jamais écrit dans le dépôt (.env.local est ignoré par git).
set_if_empty POSTGRES_PASSWORD "$(openssl rand -hex 16)"
POSTGRES_PASSWORD="$(grep '^POSTGRES_PASSWORD=' .env.local | cut -d= -f2-)"
set_if_empty DATABASE_URL "postgres://pentimento:${POSTGRES_PASSWORD}@localhost:5432/pentimento"

# Toutes les commandes compose lisent .env.local (mot de passe de la base).
COMPOSE=(docker compose --env-file .env.local)

echo "→ Construction de l'image (rapide si rien n'a changé)…"
"${COMPOSE[@]}" build

echo "→ Démarrage (le premier lancement installe les dépendances, patiente)…"
"${COMPOSE[@]}" up -d

echo "→ Attente de l'application sur $URL …"
elapsed=0
until curl -fs -o /dev/null "$URL/fr"; do
  if [ -z "$("${COMPOSE[@]}" ps --status running -q app)" ]; then
    echo "Le conteneur s'est arrêté. Dernières lignes du journal :" >&2
    "${COMPOSE[@]}" logs --tail 40 app >&2
    exit 1
  fi
  if [ "$elapsed" -ge "$TIMEOUT_SECONDS" ]; then
    echo "Pas de réponse après ${TIMEOUT_SECONDS}s. Journal : docker compose logs app" >&2
    exit 1
  fi
  sleep 2
  elapsed=$((elapsed + 2))
done

echo ""
echo "✔ Pentimento tourne sur $URL (modifie un fichier : la page se met à jour toute seule)."
echo "   Logs   : docker compose logs -f app"
echo "   Arrêt  : ./scripts/stop.sh"

if [ "${1:-}" = "--logs" ]; then
  exec "${COMPOSE[@]}" logs -f app
fi
