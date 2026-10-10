#!/usr/bin/env bash
set -euo pipefail

required=(G5_OPERATOR_ID G5_OPERATOR_RELATIONSHIP G5_OPERATOR_ATTESTATION G5_B_ASSISTED)
for name in "${required[@]}"; do
  if test -z "${!name:-}"; then
    echo "Missing required KN-065 field: $name" >&2
    exit 64
  fi
done

if test "$G5_B_ASSISTED" != "false"; then
  echo "KN-065 requires G5_B_ASSISTED=false; assisted runs cannot satisfy independent deployment." >&2
  exit 65
fi

export G5_EVIDENCE_BASENAME="kn065-independent-deploy"
export G5_PROJECT_NAME="g502kn065"

exec bash "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/run-docker-clean-deploy.sh"
