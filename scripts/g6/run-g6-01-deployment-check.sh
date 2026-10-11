#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT/evidence/g6/G6-01"
RAW_DIR="$EVIDENCE_DIR/raw"
LOG_FILE="$RAW_DIR/docker-deployment-check.log"
RESULT_FILE="$EVIDENCE_DIR/deployment-check.json"
PROJECT_NAME="${G6_PROJECT_NAME:-g601manual}"
STARTED_AT="$(date --iso-8601=seconds)"
START_EPOCH="$(date +%s)"
mkdir -p "$RAW_DIR"
exec > >(tee "$LOG_FILE") 2>&1
export POSTGRES_PASSWORD="g6-$(cat /proc/sys/kernel/random/uuid)"
export MIDDLE_PLATFORM_BASE_URL="http://host.docker.internal:43104"
set -x

cleanup() {
  local exit_code=$?
  set +e
  docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" logs --no-color > "$RAW_DIR/docker-compose-final.log" 2>&1
  docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans
  return "$exit_code"
}
trap cleanup EXIT

docker info >/dev/null
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" build --no-cache backend
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" up -d --wait
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T backend node backend/scripts/migrate.mjs up

HEALTH_STATUS="$(curl -sS -o "$RAW_DIR/healthz.json" -w '%{http_code}' http://127.0.0.1:3000/healthz)"
READY_STATUS="$(curl -sS -o "$RAW_DIR/readyz.json" -w '%{http_code}' http://127.0.0.1:3000/readyz)"
test "$HEALTH_STATUS" = "200"
test "$READY_STATUS" = "200"

docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database \
  psql -U emergency -d emergency -v ON_ERROR_STOP=1 -c \
  "INSERT INTO em_audit_log(trace_id, actor_id, action, outcome, details) VALUES ('g6-manual-sentinel', 'member-b', 'G6_MANUAL_VERIFY', 'allowed', '{\"scope\":\"G6-01\"}'::jsonb);"
TABLES_BEFORE="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
SENTINEL_BEFORE="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM em_audit_log WHERE trace_id='g6-manual-sentinel';")"
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database sh -lc \
  "pg_dump -U emergency -d emergency -Fc -f /tmp/g6-backup.dump && sha256sum /tmp/g6-backup.dump" \
  | tee "$RAW_DIR/backup-sha256.txt"
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database createdb -U emergency emergency_restore
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database \
  pg_restore -U emergency -d emergency_restore --exit-on-error /tmp/g6-backup.dump
TABLES_AFTER="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database psql -U emergency -d emergency_restore -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
SENTINEL_AFTER="$(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" exec -T database psql -U emergency -d emergency_restore -Atqc "SELECT count(*) FROM em_audit_log WHERE trace_id='g6-manual-sentinel';")"
test "$TABLES_BEFORE" = "$TABLES_AFTER"
test "$SENTINEL_BEFORE" = "1"
test "$SENTINEL_AFTER" = "1"

docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" restart backend
for _ in $(seq 1 30); do
  RESTART_READY_STATUS="$(curl -sS -o "$RAW_DIR/readyz-after-restart.json" -w '%{http_code}' http://127.0.0.1:3000/readyz 2>/dev/null || true)"
  test "$RESTART_READY_STATUS" = "200" && break
  sleep 1
done
test "$RESTART_READY_STATUS" = "200"

FINISHED_AT="$(date --iso-8601=seconds)"
DURATION_SECONDS="$(( $(date +%s) - START_EPOCH ))"
DOCKER_VERSION="$(docker version --format '{{.Server.Version}}')"
COMPOSE_VERSION="$(docker compose version --short)"
PLATFORM="$(uname -srmo)"
export RESULT_FILE STARTED_AT FINISHED_AT DURATION_SECONDS HEALTH_STATUS READY_STATUS RESTART_READY_STATUS
export TABLES_BEFORE TABLES_AFTER SENTINEL_BEFORE SENTINEL_AFTER DOCKER_VERSION COMPOSE_VERSION PLATFORM
python3 - <<'PY'
import json, os
result = {
  "schemaVersion": 1,
  "taskId": "G6-01",
  "releaseCommit": "beb605f83e738a39dfe388ed4bc25b5b724eddcf",
  "evidenceKind": "MEMBER_B_ISOLATED_DOCKER_DEPLOYMENT_AND_RECOVERY",
  "startedAt": os.environ["STARTED_AT"],
  "finishedAt": os.environ["FINISHED_AT"],
  "durationSeconds": int(os.environ["DURATION_SECONDS"]),
  "environment": {"docker": os.environ["DOCKER_VERSION"], "compose": os.environ["COMPOSE_VERSION"], "platform": os.environ["PLATFORM"]},
  "checks": {
    "healthStatus": int(os.environ["HEALTH_STATUS"]),
    "readyStatus": int(os.environ["READY_STATUS"]),
    "readyAfterRestartStatus": int(os.environ["RESTART_READY_STATUS"]),
    "publicTablesBeforeRestore": int(os.environ["TABLES_BEFORE"]),
    "publicTablesAfterRestore": int(os.environ["TABLES_AFTER"]),
    "sentinelBeforeRestore": int(os.environ["SENTINEL_BEFORE"]),
    "sentinelAfterRestore": int(os.environ["SENTINEL_AFTER"]),
  },
  "status": "PASS",
  "evidenceClassification": "MEMBER_B_LOCAL_ISOLATED_RUN",
  "boundaries": [
    "This run verifies the documented Docker deployment, migration, health, readiness, restart, backup and restore commands in an isolated local project.",
    "The owner middle platform and six owner external systems were not connected.",
    "The executor was member B; this is not KN-065 independent non-contractor deployment evidence.",
  ],
}
with open(os.environ["RESULT_FILE"], "w", encoding="utf-8") as handle:
  json.dump(result, handle, ensure_ascii=False, indent=2)
  handle.write("\n")
PY

set +x
trap - EXIT
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" logs --no-color > "$RAW_DIR/docker-compose-final.log" 2>&1
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans
RESIDUAL_CONTAINERS="$(docker ps -aq --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_VOLUMES="$(docker volume ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_NETWORKS="$(docker network ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
test "$RESIDUAL_CONTAINERS" -eq 0
test "$RESIDUAL_VOLUMES" -eq 0
test "$RESIDUAL_NETWORKS" -eq 0
echo "G6-01 deployment check PASS; cleanup residuals=${RESIDUAL_CONTAINERS}/${RESIDUAL_VOLUMES}/${RESIDUAL_NETWORKS}"
