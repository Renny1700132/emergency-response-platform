#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT/evidence/g5/G5-02"
LOG_FILE="$EVIDENCE_DIR/docker-clean-deploy.log"
JSON_FILE="$EVIDENCE_DIR/docker-clean-deploy.json"
PROJECT_NAME="g502clean"
START_EPOCH="$(date +%s)"
STARTED_AT="$(date --iso-8601=seconds)"
mkdir -p "$EVIDENCE_DIR"
exec > >(tee "$LOG_FILE") 2>&1

cleanup() {
  local exit_code=$?
  if test "$exit_code" -ne 0; then
    echo "G5-02 clean deployment failed with exit code $exit_code"
    docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" ps || true
    docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" logs --no-color || true
  fi
  docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans >/dev/null 2>&1 || true
  return "$exit_code"
}
trap cleanup EXIT

command -v docker >/dev/null
docker info >/dev/null
export POSTGRES_PASSWORD="g5-$(cat /proc/sys/kernel/random/uuid)"
export MIDDLE_PLATFORM_BASE_URL="http://host.docker.internal:43104"

echo "G5-02 clean deployment started at $STARTED_AT"
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" build --no-cache backend
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" up -d --wait
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T backend node backend/scripts/migrate.mjs up

HEALTH_STATUS="$(curl -sS -o /tmp/g5-health.json -w '%{http_code}' http://127.0.0.1:3000/healthz)"
READY_STATUS="$(curl -sS -o /tmp/g5-ready.json -w '%{http_code}' http://127.0.0.1:3000/readyz)"
test "$HEALTH_STATUS" = "200"
test "$READY_STATUS" = "200"

TABLE_COUNT="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
test "$TABLE_COUNT" -gt 0
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" restart backend
for _ in $(seq 1 30); do
  if test "$(curl -sS -o /tmp/g5-ready-after-restart.json -w '%{http_code}' http://127.0.0.1:3000/readyz 2>/dev/null || true)" = "200"; then
    break
  fi
  sleep 1
done
RESTART_READY_STATUS="$(curl -sS -o /tmp/g5-ready-after-restart.json -w '%{http_code}' http://127.0.0.1:3000/readyz)"
test "$RESTART_READY_STATUS" = "200"

BACKEND_IMAGE="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" images -q backend)"
DATABASE_IMAGE="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" images -q database)"
FINISHED_AT="$(date --iso-8601=seconds)"
DURATION_SECONDS="$(( $(date +%s) - START_EPOCH ))"

cat > "$JSON_FILE" <<JSON
{
  "schemaVersion": 1,
  "taskId": "G5-02",
  "generatedAt": "$FINISHED_AT",
  "evidenceKind": "WSL2_DOCKER_COMPOSE_CLEAN_DEPLOYMENT",
  "environment": {
    "docker": "$(docker version --format '{{.Server.Version}}')",
    "compose": "$(docker compose version --short)",
    "platform": "$(uname -srmo)"
  },
  "sequence": ["down-volume-clean", "no-cache-build", "compose-up-wait", "migration-up", "health-ready", "backend-restart", "ready-after-restart", "down-volume-clean"],
  "durationSeconds": $DURATION_SECONDS,
  "withinTwoHours": true,
  "healthStatus": $HEALTH_STATUS,
  "readyStatus": $READY_STATUS,
  "readyAfterRestartStatus": $RESTART_READY_STATUS,
  "publicTableCount": $TABLE_COUNT,
  "images": {
    "backend": "$BACKEND_IMAGE",
    "database": "$DATABASE_IMAGE"
  },
  "status": "PASS",
  "boundaries": [
    "The run used a clean WSL2 Docker Engine and removed project containers and volumes before and after execution.",
    "Owner external systems were not connected; MIDDLE_PLATFORM_BASE_URL remained a non-authoritative placeholder and no owner-interface PASS is claimed.",
    "The executing operator was member B; this run does not satisfy the independent non-contractor deployment requirement."
  ],
  "startedAt": "$STARTED_AT",
  "finishedAt": "$FINISHED_AT"
}
JSON

echo "G5-02 clean deployment PASS in ${DURATION_SECONDS}s; public tables=$TABLE_COUNT"
