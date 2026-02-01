#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: zenhub-move-issue.sh <issue_number> <pipeline_name> [position]" >&2
  echo "Example: zenhub-move-issue.sh 60 Review top" >&2
  exit 1
fi

if [[ -z "${ZENHUB_TOKEN:-}" ]]; then
  echo "ZENHUB_TOKEN is required (export ZENHUB_TOKEN=...)." >&2
  exit 1
fi

issue_number="$1"
pipeline_name="$2"
position="${3:-top}"
repo="${ZENHUB_REPO:-kondate-team/kondate-loop}"

if ! command -v gh >/dev/null 2>&1; then
  echo "gh is required." >&2
  exit 1
fi

repo_id="$(gh api "repos/${repo}" --jq '.id')"
board_json="$(curl -fsSL -H "X-Authentication-Token: ${ZENHUB_TOKEN}" "https://api.zenhub.com/p1/repositories/${repo_id}/board")"

set +e
pipeline_id="$(
  python3 - "$pipeline_name" <<'PY'
import json
import sys

pipeline_name = sys.argv[1]
data = json.load(sys.stdin)
for pipeline in data.get("pipelines", []):
  if pipeline.get("name") == pipeline_name:
    print(pipeline.get("id", ""))
    sys.exit(0)
sys.exit(1)
PY
  <<<"$board_json"
)"
pipeline_status=$?
set -e

if [[ $pipeline_status -ne 0 || -z "${pipeline_id}" ]]; then
  echo "Pipeline not found: ${pipeline_name}" >&2
  exit 1
fi

curl -fsSL \
  -X POST \
  -H "X-Authentication-Token: ${ZENHUB_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"pipeline_id\":\"${pipeline_id}\",\"position\":\"${position}\"}" \
  "https://api.zenhub.com/p1/repositories/${repo_id}/issues/${issue_number}/moves" \
  >/dev/null

echo "Moved #${issue_number} to ${pipeline_name}"
