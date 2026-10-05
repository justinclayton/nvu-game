#!/bin/sh
# Makes issue <blocked> blocked by issue <blocker> through GitHub's native
# issue dependencies. The planner calls this instead of `gh api`, so its tool
# allowlist names one fixed write rather than the whole REST API.
set -eu

for n in "${1:-}" "${2:-}"; do
  case "$n" in
    '' | *[!0-9]*) echo "usage: block.sh <blocked issue number> <blocker issue number>" >&2; exit 2 ;;
  esac
done

repo=${GITHUB_REPOSITORY:?}
blocker_id=$(gh api "repos/$repo/issues/$2" --jq .id)
gh api -X POST "repos/$repo/issues/$1/dependencies/blocked_by" -F issue_id="$blocker_id" --silent
echo "#$1 is now blocked by #$2"
