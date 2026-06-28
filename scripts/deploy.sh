#!/usr/bin/env bash
# MentorMe — one-command deploy to the VPS.
#
# Why this script exists: the server is in Iran and CANNOT build images
# (Docker registries are blocked + only 1.7GB RAM). So images are built
# LOCALLY, shipped via `docker save | ssh "podman load"`, and the stack is
# restarted on the server. Secrets (.env.production, certs) live ONLY on the
# server and are never shipped from here.
#
# Usage:
#   ./scripts/deploy.sh            # build + ship + restart (app + migrate)
#   SERVER=root@1.2.3.4 ./scripts/deploy.sh   # override target
#
# Requires: local Docker (with registry-mirror to build), SSH key access to the
# server, and that the server already has Podman + the compose binary + the
# base images (postgres, caddy) loaded (done on first deploy).

set -euo pipefail

# --- config (override via env) ---
SERVER="${SERVER:-root@185.164.73.133}"
KEY="${KEY:-$HOME/.ssh/id_ed25519_mentorme}"
REMOTE_DIR="${REMOTE_DIR:-/opt/mentorme}"
REMOTE_DOCKER_HOST="unix:///run/podman/podman.sock"

cd "$(dirname "$0")/.."
SSH=(ssh -i "$KEY" -o BatchMode=yes "$SERVER")

echo "==> 1/5  Building images locally (app + migrate)..."
docker compose -f docker-compose.yml build app migrate

echo "==> 2/5  Saving + compressing images..."
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
docker save mentorme-app:latest mentorme-migrate:latest | gzip -1 > "$TMP/img.tar.gz"
echo "    $(du -h "$TMP/img.tar.gz" | cut -f1) to ship"

echo "==> 3/5  Shipping to $SERVER ..."
scp -i "$KEY" -o BatchMode=yes "$TMP/img.tar.gz" "$SERVER:$REMOTE_DIR/img.tar.gz"

echo "==> 4/5  Loading images on the server..."
"${SSH[@]}" "gunzip -c $REMOTE_DIR/img.tar.gz | podman load && rm -f $REMOTE_DIR/img.tar.gz"

echo "==> 5/5  Restarting stack (migrations run automatically before app)..."
"${SSH[@]}" "cd $REMOTE_DIR && export DOCKER_HOST=$REMOTE_DOCKER_HOST && \
  docker-compose --env-file .env.production -f docker-compose.prod.yml up -d"

echo
echo "✅ Deploy complete. Quick check:"
curl -sL -o /dev/null -w "   https://mentorme.ir -> %{http_code}\n" --connect-timeout 15 https://mentorme.ir/ || true
echo
echo "Notes:"
echo "  - First-time seeding (DB data) is NOT run here. Run once manually:"
echo "      ssh -i $KEY $SERVER 'cd $REMOTE_DIR && DOCKER_HOST=$REMOTE_DOCKER_HOST \\"
echo "        docker-compose --env-file .env.production -f docker-compose.prod.yml --profile seed run --rm seed'"
echo "  - Base images (postgres, caddy) are assumed already loaded on the server."
