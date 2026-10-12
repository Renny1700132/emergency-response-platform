#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
EVIDENCE_DIR="$ROOT/evidence/g6/G6-01"
RAW_DIR="$EVIDENCE_DIR/raw/remediation"
STEP_DIR="$RAW_DIR/steps"
RESULT_FILE="$EVIDENCE_DIR/remediation-deployment-check.json"
LEDGER_FILE="$EVIDENCE_DIR/remediation-command-ledger.json"
PROJECT_NAME="${G6_PROJECT_NAME:-g601remediation}"
COMPOSE=(docker compose -f "$ROOT/compose.yaml" -p "$PROJECT_NAME")

STARTED_AT="$(date --iso-8601=seconds)"
START_EPOCH="$(date +%s)"
export POSTGRES_PASSWORD="g6-$(cat /proc/sys/kernel/random/uuid)"
export MIDDLE_PLATFORM_BASE_URL="http://host.docker.internal:43104"
export FRONTEND_PORT="18080"
export G6_ROOT="$ROOT" G6_RAW_DIR="$RAW_DIR" G6_STEP_DIR="$STEP_DIR"

record_step() {
  local id="$1" command="$2" started="$3" finished="$4" exit_code="$5" raw="$6"
  export G6_STEP_ID="$id" G6_STEP_COMMAND="$command" G6_STEP_STARTED="$started" G6_STEP_FINISHED="$finished" G6_STEP_EXIT="$exit_code" G6_STEP_RAW="$raw"
  python3 - <<'PY' >> "$G6_RAW_DIR/steps.jsonl"
import json, os
print(json.dumps({
  "id": os.environ["G6_STEP_ID"],
  "command": os.environ["G6_STEP_COMMAND"],
  "startedAt": os.environ["G6_STEP_STARTED"],
  "finishedAt": os.environ["G6_STEP_FINISHED"],
  "exitCode": int(os.environ["G6_STEP_EXIT"]),
  "rawLog": os.environ["G6_STEP_RAW"],
}, ensure_ascii=False))
PY
}

run_step() {
  local id="$1"; shift
  local command started finished exit_code raw
  command="$(printf '%q ' "$@")"
  started="$(date --iso-8601=seconds)"
  raw="$STEP_DIR/${id}.log"
  set +e
  "$@" > >(tee "$raw") 2>&1
  exit_code=$?
  set -e
  finished="$(date --iso-8601=seconds)"
  record_step "$id" "$command" "$started" "$finished" "$exit_code" "evidence/g6/G6-01/raw/remediation/steps/${id}.log"
  if [[ $exit_code -ne 0 ]]; then
    echo "step $id failed with exit $exit_code" >&2
    exit "$exit_code"
  fi
}

cleanup_failure() {
  local exit_code=$?
  set +e
  "${COMPOSE[@]}" logs --no-color > "$RAW_DIR/compose-final-on-failure.log" 2>&1
  "${COMPOSE[@]}" down -v --remove-orphans >> "$RAW_DIR/compose-final-on-failure.log" 2>&1
  exit "$exit_code"
}

cd "$ROOT"
WINDOWS_ROOT="$(wslpath -w "$ROOT")"
if git rev-parse --git-dir >/dev/null 2>&1; then
  GIT=(git)
else
  GIT=(git.exe -C "$WINDOWS_ROOT")
fi
GIT_HEAD="$("${GIT[@]}" rev-parse HEAD)"
GIT_BRANCH="$("${GIT[@]}" branch --show-current)"
GIT_STATUS="$("${GIT[@]}" status --porcelain=v1)"
if [[ -n "$GIT_STATUS" && "${G6_ALLOW_DIRTY:-false}" != "true" ]]; then
  echo "refusing to run against a dirty worktree" >&2
  printf '%s\n' "$GIT_STATUS" >&2
  exit 65
fi
mkdir -p "$STEP_DIR"
: > "$RAW_DIR/steps.jsonl"
printf '%s' "$GIT_STATUS" > "$RAW_DIR/git-status.txt"
"${GIT[@]}" diff --stat > "$RAW_DIR/git-diff-stat.txt"
"${COMPOSE[@]}" config > "$RAW_DIR/compose-config.yaml"
COMPOSE_SHA256="$(sha256sum "$RAW_DIR/compose-config.yaml" | awk '{print $1}')"
DOCKERFILE_BACKEND_SHA256="$(sha256sum "$ROOT/backend/Dockerfile" | awk '{print $1}')"
DOCKERFILE_FRONTEND_SHA256="$(sha256sum "$ROOT/frontend/Dockerfile" | awk '{print $1}')"
export GIT_HEAD GIT_BRANCH COMPOSE_SHA256 DOCKERFILE_BACKEND_SHA256 DOCKERFILE_FRONTEND_SHA256
trap cleanup_failure EXIT
set -e

run_step 01-docker-info docker info
run_step 02-clean-before "${COMPOSE[@]}" down -v --remove-orphans
run_step 03-build-backend "${COMPOSE[@]}" build --no-cache backend
run_step 04-build-frontend "${COMPOSE[@]}" build --no-cache frontend
BACKEND_IMAGE_ID="$(docker image inspect "${PROJECT_NAME}-backend" --format '{{.Id}}')"
FRONTEND_IMAGE_ID="$(docker image inspect "${PROJECT_NAME}-frontend" --format '{{.Id}}')"
export BACKEND_IMAGE_ID FRONTEND_IMAGE_ID
run_step 05-up-all "${COMPOSE[@]}" up -d --wait
run_step 06-compose-ps "${COMPOSE[@]}" ps
run_step 07-migrate-up "${COMPOSE[@]}" exec -T backend node backend/scripts/migrate.mjs up
run_step 08-health bash -lc "curl -fsS -o '$RAW_DIR/healthz.json' -w '%{http_code}\n' http://127.0.0.1:3000/healthz | grep -x 200"
run_step 09-ready bash -lc "curl -fsS -o '$RAW_DIR/readyz.json' -w '%{http_code}\n' http://127.0.0.1:3000/readyz | grep -x 200"
run_step 10-frontend bash -lc "curl -fsS -o '$RAW_DIR/frontend-index.html' -w '%{http_code}\n' http://127.0.0.1:${FRONTEND_PORT}/ | grep -x 200 && grep -q '<div id=\"app\"></div>' '$RAW_DIR/frontend-index.html'"

run_step 11-insert-sentinel "${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -v ON_ERROR_STOP=1 -c \
  "INSERT INTO em_audit_log(trace_id, actor_id, action, outcome, details) VALUES ('g6-remediation-sentinel', 'member-b', 'G6_REMEDIATION_VERIFY', 'allowed', '{\"scope\":\"G6-01\"}'::jsonb);"
TABLES_BEFORE="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
MIGRATIONS_BEFORE="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM schema_migrations;")"
SENTINEL_BEFORE="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM em_audit_log WHERE trace_id='g6-remediation-sentinel';")"
export TABLES_BEFORE MIGRATIONS_BEFORE SENTINEL_BEFORE

run_step 12-backup "${COMPOSE[@]}" exec -T database sh -lc \
  "pg_dump -U emergency -d emergency -Fc -f /tmp/g6-remediation.dump && sha256sum /tmp/g6-remediation.dump"
mkdir -p "$RAW_DIR/backup"
run_step 13-copy-backup "${COMPOSE[@]}" cp database:/tmp/g6-remediation.dump "$RAW_DIR/backup/g6-remediation.dump"
BACKUP_SHA256="$(sha256sum "$RAW_DIR/backup/g6-remediation.dump" | tee "$RAW_DIR/backup/g6-remediation.sha256" | awk '{print $1}')"
test -s "$RAW_DIR/backup/g6-remediation.dump"
export BACKUP_SHA256

run_step 14-stop-writers "${COMPOSE[@]}" stop frontend backend
run_step 15-rollback-one "${COMPOSE[@]}" run --rm backend node backend/scripts/migrate.mjs down --steps=1
MIGRATIONS_AFTER_DOWN="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM schema_migrations;")"
TABLES_AFTER_DOWN="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
test "$MIGRATIONS_AFTER_DOWN" = "2"
test "$TABLES_AFTER_DOWN" -lt "$TABLES_BEFORE"
export MIGRATIONS_AFTER_DOWN TABLES_AFTER_DOWN
run_step 16-reapply-migration "${COMPOSE[@]}" run --rm backend node backend/scripts/migrate.mjs up
MIGRATIONS_AFTER_UP="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM schema_migrations;")"
TABLES_AFTER_UP="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
SENTINEL_AFTER_UP="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency -Atqc "SELECT count(*) FROM em_audit_log WHERE trace_id='g6-remediation-sentinel';")"
test "$MIGRATIONS_AFTER_UP" = "$MIGRATIONS_BEFORE"
test "$TABLES_AFTER_UP" = "$TABLES_BEFORE"
test "$SENTINEL_AFTER_UP" = "1"
export MIGRATIONS_AFTER_UP TABLES_AFTER_UP SENTINEL_AFTER_UP
run_step 17-start-after-rollback "${COMPOSE[@]}" up -d --wait backend frontend
run_step 18-ready-after-rollback bash -lc "curl -fsS -o '$RAW_DIR/readyz-after-rollback.json' -w '%{http_code}\n' http://127.0.0.1:3000/readyz | grep -x 200"

run_step 19-create-restore-db "${COMPOSE[@]}" exec -T database createdb -U emergency emergency_restore
run_step 20-restore-backup "${COMPOSE[@]}" exec -T database pg_restore -U emergency -d emergency_restore --exit-on-error /tmp/g6-remediation.dump
TABLES_RESTORED="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency_restore -Atqc "SELECT count(*) FROM pg_tables WHERE schemaname='public';")"
SENTINEL_RESTORED="$("${COMPOSE[@]}" exec -T database psql -U emergency -d emergency_restore -Atqc "SELECT count(*) FROM em_audit_log WHERE trace_id='g6-remediation-sentinel';")"
test "$TABLES_RESTORED" = "$TABLES_BEFORE"
test "$SENTINEL_RESTORED" = "1"
export TABLES_RESTORED SENTINEL_RESTORED

run_step 21-backend-logs "${COMPOSE[@]}" logs --no-color --since=30m backend
run_step 22-frontend-logs "${COMPOSE[@]}" logs --no-color --since=30m frontend
run_step 23-database-logs "${COMPOSE[@]}" logs --no-color --since=30m database
run_step 24-restart-backend "${COMPOSE[@]}" restart backend
run_step 25-ready-after-restart bash -lc "for i in \$(seq 1 30); do code=\$(curl -sS -o '$RAW_DIR/readyz-after-restart.json' -w '%{http_code}' http://127.0.0.1:3000/readyz 2>/dev/null || true); [[ \"\$code\" = 200 ]] && exit 0; sleep 1; done; exit 1"
run_step 26-cleanup "${COMPOSE[@]}" down -v --remove-orphans

RESIDUAL_CONTAINERS="$(docker ps -aq --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_VOLUMES="$(docker volume ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
RESIDUAL_NETWORKS="$(docker network ls -q --filter "label=com.docker.compose.project=$PROJECT_NAME" | wc -l | tr -d '[:space:]')"
test "$RESIDUAL_CONTAINERS" -eq 0
test "$RESIDUAL_VOLUMES" -eq 0
test "$RESIDUAL_NETWORKS" -eq 0
export RESIDUAL_CONTAINERS RESIDUAL_VOLUMES RESIDUAL_NETWORKS

FINISHED_AT="$(date --iso-8601=seconds)"
DURATION_SECONDS="$(( $(date +%s) - START_EPOCH ))"
DOCKER_VERSION="$(docker version --format '{{.Server.Version}}')"
COMPOSE_VERSION="$(docker compose version --short)"
PLATFORM="$(uname -srmo)"
export STARTED_AT FINISHED_AT DURATION_SECONDS DOCKER_VERSION COMPOSE_VERSION PLATFORM RESULT_FILE LEDGER_FILE
python3 - <<'PY'
import json, os
from pathlib import Path
root = Path(os.environ['G6_ROOT'])
raw = Path(os.environ['G6_RAW_DIR'])
steps = [json.loads(line) for line in (raw / 'steps.jsonl').read_text(encoding='utf-8').splitlines() if line]
result = {
  'schemaVersion': 2,
  'taskId': 'G6-01',
  'evidenceKind': 'MEMBER_B_ISOLATED_FULL_STACK_DEPLOYMENT_ROLLBACK_AND_RECOVERY',
  'startedAt': os.environ['STARTED_AT'],
  'finishedAt': os.environ['FINISHED_AT'],
  'durationSeconds': int(os.environ['DURATION_SECONDS']),
  'releaseCommit': os.environ['GIT_HEAD'],
  'git': {'branch': os.environ['GIT_BRANCH'], 'dirty': False, 'statusFile': 'evidence/g6/G6-01/raw/remediation/git-status.txt'},
  'fingerprints': {
    'composeConfigSha256': os.environ['COMPOSE_SHA256'],
    'backendDockerfileSha256': os.environ['DOCKERFILE_BACKEND_SHA256'],
    'frontendDockerfileSha256': os.environ['DOCKERFILE_FRONTEND_SHA256'],
    'backendImageId': os.environ['BACKEND_IMAGE_ID'],
    'frontendImageId': os.environ['FRONTEND_IMAGE_ID'],
    'backupSha256': os.environ['BACKUP_SHA256'],
  },
  'environment': {'docker': os.environ['DOCKER_VERSION'], 'compose': os.environ['COMPOSE_VERSION'], 'platform': os.environ['PLATFORM']},
  'checks': {
    'steps': len(steps), 'stepFailures': sum(step['exitCode'] != 0 for step in steps),
    'healthStatus': 200, 'readyStatus': 200, 'frontendStatus': 200, 'readyAfterRollbackStatus': 200, 'readyAfterRestartStatus': 200,
    'migrationsBefore': int(os.environ['MIGRATIONS_BEFORE']), 'migrationsAfterDown': int(os.environ['MIGRATIONS_AFTER_DOWN']), 'migrationsAfterUp': int(os.environ['MIGRATIONS_AFTER_UP']),
    'publicTablesBefore': int(os.environ['TABLES_BEFORE']), 'publicTablesAfterDown': int(os.environ['TABLES_AFTER_DOWN']), 'publicTablesAfterUp': int(os.environ['TABLES_AFTER_UP']), 'publicTablesRestored': int(os.environ['TABLES_RESTORED']),
    'sentinelBefore': int(os.environ['SENTINEL_BEFORE']), 'sentinelAfterUp': int(os.environ['SENTINEL_AFTER_UP']), 'sentinelRestored': int(os.environ['SENTINEL_RESTORED']),
    'cleanupResiduals': {'containers': int(os.environ['RESIDUAL_CONTAINERS']), 'volumes': int(os.environ['RESIDUAL_VOLUMES']), 'networks': int(os.environ['RESIDUAL_NETWORKS'])},
  },
  'status': 'PASS',
  'evidenceClassification': 'MEMBER_B_LOCAL_ISOLATED_RUN',
  'boundaries': [
    'This run verifies the documented Web/H5 static host, reverse proxy, backend, PostgreSQL, targeted one-step rollback, re-upgrade, backup copy, restore, logs, restart and cleanup in an isolated local project.',
    'The owner middle platform and six owner external systems were not connected.',
    'The executor was member B; this is not KN-065 independent non-contractor deployment evidence.',
  ],
}
Path(os.environ['RESULT_FILE']).write_text(json.dumps(result, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
Path(os.environ['LEDGER_FILE']).write_text(json.dumps({'schemaVersion': 1, 'taskId': 'G6-01', 'releaseCommit': os.environ['GIT_HEAD'], 'steps': steps}, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
PY

trap - EXIT
echo "G6-01 remediation deployment check PASS; steps=26; cleanup residuals=${RESIDUAL_CONTAINERS}/${RESIDUAL_VOLUMES}/${RESIDUAL_NETWORKS}"
