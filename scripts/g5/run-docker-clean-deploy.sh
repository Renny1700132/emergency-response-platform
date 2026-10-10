#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT/evidence/g5/G5-02"
EVIDENCE_BASENAME="${G5_EVIDENCE_BASENAME:-docker-clean-deploy}"
LOG_FILE="$EVIDENCE_DIR/${EVIDENCE_BASENAME}.log"
JSON_FILE="$EVIDENCE_DIR/${EVIDENCE_BASENAME}.json"
PROJECT_NAME="${G5_PROJECT_NAME:-g502clean}"
START_EPOCH="$(date +%s)"
STARTED_AT="$(date --iso-8601=seconds)"
mkdir -p "$EVIDENCE_DIR"
exec > >(tee "$LOG_FILE") 2>&1

cleanup_on_failure() {
  local exit_code=$?
  if test "$exit_code" -ne 0; then
    echo "G5-02 clean deployment failed with exit code $exit_code"
    docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" ps || true
    docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" logs --no-color || true
    docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans || true
  fi
  return "$exit_code"
}
trap cleanup_on_failure EXIT

command -v docker >/dev/null
docker info >/dev/null
export POSTGRES_PASSWORD="g5-$(cat /proc/sys/kernel/random/uuid)"
export MIDDLE_PLATFORM_BASE_URL="http://host.docker.internal:43104"

echo "G5-02 clean deployment started at $STARTED_AT"
echo "Evidence basename: $EVIDENCE_BASENAME; Compose project: $PROJECT_NAME"
if test -n "${G5_OPERATOR_ID:-}"; then
  echo "Operator identity: $G5_OPERATOR_ID"
  echo "Operator relationship: ${G5_OPERATOR_RELATIONSHIP:-UNSPECIFIED}"
  echo "Member B assisted: ${G5_B_ASSISTED:-UNSPECIFIED}"
fi

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

echo "Running checked cleanup before recording PASS"
docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME" down -v --remove-orphans
RESIDUAL_CONTAINERS="$(docker ps -aq --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_VOLUMES="$(docker volume ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_NETWORKS="$(docker network ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
test "$RESIDUAL_CONTAINERS" -eq 0
test "$RESIDUAL_VOLUMES" -eq 0
test "$RESIDUAL_NETWORKS" -eq 0

FINISHED_AT="$(date --iso-8601=seconds)"
DURATION_SECONDS="$(( $(date +%s) - START_EPOCH ))"
WITHIN_TWO_HOURS=false
if test "$DURATION_SECONDS" -le 7200; then
  WITHIN_TWO_HOURS=true
fi
test "$WITHIN_TWO_HOURS" = true

DOCKER_VERSION="$(docker version --format '{{.Server.Version}}')"
COMPOSE_VERSION="$(docker compose version --short)"
RUN_PLATFORM="$(uname -srmo)"
export JSON_FILE FINISHED_AT DURATION_SECONDS WITHIN_TWO_HOURS HEALTH_STATUS READY_STATUS
export RESTART_READY_STATUS TABLE_COUNT BACKEND_IMAGE DATABASE_IMAGE STARTED_AT
export RESIDUAL_CONTAINERS RESIDUAL_VOLUMES RESIDUAL_NETWORKS EVIDENCE_BASENAME PROJECT_NAME
export DOCKER_VERSION COMPOSE_VERSION RUN_PLATFORM
node --input-type=module <<'NODE'
import { writeFileSync } from 'node:fs'

const optional = (name) => process.env[name] || null
const independent = process.env.EVIDENCE_BASENAME === 'kn065-independent-deploy'
const result = {
  schemaVersion: 2,
  taskId: 'G5-02',
  generatedAt: process.env.FINISHED_AT,
  evidenceKind: independent ? 'KN065_INDEPENDENT_DOCKER_COMPOSE_CLEAN_DEPLOYMENT' : 'WSL2_DOCKER_COMPOSE_CLEAN_DEPLOYMENT',
  operator: {
    auditableIdentity: optional('G5_OPERATOR_ID'),
    relationshipToContractor: optional('G5_OPERATOR_RELATIONSHIP'),
    attestation: optional('G5_OPERATOR_ATTESTATION'),
    memberBAssisted: process.env.G5_B_ASSISTED === undefined ? null : process.env.G5_B_ASSISTED === 'true',
  },
  environment: {
    docker: process.env.DOCKER_VERSION,
    compose: process.env.COMPOSE_VERSION,
    platform: process.env.RUN_PLATFORM,
  },
  sequence: ['down-volume-clean', 'no-cache-build', 'compose-up-wait', 'migration-up', 'health-ready', 'backend-restart', 'ready-after-restart', 'checked-down-volume-clean'],
  durationSeconds: Number(process.env.DURATION_SECONDS),
  withinTwoHours: process.env.WITHIN_TWO_HOURS === 'true',
  healthStatus: Number(process.env.HEALTH_STATUS),
  readyStatus: Number(process.env.READY_STATUS),
  readyAfterRestartStatus: Number(process.env.RESTART_READY_STATUS),
  publicTableCount: Number(process.env.TABLE_COUNT),
  images: { backend: process.env.BACKEND_IMAGE, database: process.env.DATABASE_IMAGE },
  cleanup: {
    commandExitCode: 0,
    residualContainers: Number(process.env.RESIDUAL_CONTAINERS),
    residualVolumes: Number(process.env.RESIDUAL_VOLUMES),
    residualNetworks: Number(process.env.RESIDUAL_NETWORKS),
    status: 'PASS',
  },
  status: 'PASS',
  boundaries: [
    'The run starts from removed project volumes and performs a no-cache application image build.',
    'Owner external systems are not connected by this script; no owner-interface PASS is claimed.',
    independent
      ? 'Independent status is subject to C review of the operator identity, relationship and no-assistance attestation.'
      : 'A member-B run does not satisfy KN-065 independent non-contractor deployment.',
  ],
  startedAt: process.env.STARTED_AT,
  finishedAt: process.env.FINISHED_AT,
}
writeFileSync(process.env.JSON_FILE, `${JSON.stringify(result, null, 2)}\n`, 'utf8')
NODE

trap - EXIT
echo "G5-02 clean deployment PASS in ${DURATION_SECONDS}s; public tables=$TABLE_COUNT; cleanup residuals=${RESIDUAL_CONTAINERS}/${RESIDUAL_VOLUMES}/${RESIDUAL_NETWORKS}"
