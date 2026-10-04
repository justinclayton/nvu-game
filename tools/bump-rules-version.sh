#!/bin/sh
# Raises rulebook.md's "Rules version" patch number when the rulebook has
# changed since the branch left main and the version is not already above
# main's. Run through `make bump-rules-version`, which the pre-commit hook, CI
# and a person after a merge all use.
#
# It edits only the rulebook. When the rulebook is staged it judges and edits
# the staged copy too, leaving unstaged edits unstaged. Rebuilding the generated
# card modules, which stamp the version, is the caller's job.
#
# POSIX sh and no GNU-only flags, so it runs the same on macOS and Linux.
set -eu
cd "$(dirname "$0")/.."

RULEBOOK=rulebook.md

version_of() { sed -n 's/^Rules version:[[:space:]]*//p' | head -n 1; }

main=
for ref in origin/main main; do
  if git rev-parse --verify --quiet "$ref" >/dev/null; then main=$ref; break; fi
done
base=$([ -n "$main" ] && git merge-base HEAD "$main" || true)
# Until the move to the repo root lands on main, the base copy is still under design/.
base_id=
base_path=
for p in "$RULEBOOK" "design/$RULEBOOK"; do
  if [ -n "$base" ] && base_id=$(git rev-parse --verify --quiet "$base:$p"); then base_path=$p; break; fi
done
[ -n "$base_id" ] || { echo "no main to compare the rulebook against"; exit 0; }

if git diff --cached --name-only -- "$RULEBOOK" | grep -q .; then
  staged=1
  current_id=$(git rev-parse ":$RULEBOOK")
  after=$(git show ":$RULEBOOK" | version_of)
else
  staged=
  current_id=$(git hash-object "$RULEBOOK")
  after=$(version_of < "$RULEBOOK")
fi
before=$(git show "$base:$base_path" | version_of)

above=$(awk -v a="$after" -v b="$before" 'BEGIN {
  split(a, x, "."); split(b, y, ".")
  for (i = 1; i <= 3; i++) if (x[i] + 0 != y[i] + 0) { print (x[i] + 0 > y[i] + 0); exit }
  print 0 }')
if [ "$current_id" = "$base_id" ] || [ "$above" = 1 ]; then
  echo "rules version is already raised, or the rulebook is unchanged"
  exit 0
fi

next=$(echo "$before" | awk -F. -v OFS=. '{ $NF = $NF + 1; print }')
bump() { sed "s/^\(Rules version:[[:space:]]*\)[^[:space:]]*/\1$next/"; }

tmp=$(mktemp)
trap 'rm -f "$tmp"' EXIT
bump < "$RULEBOOK" > "$tmp"
cat "$tmp" > "$RULEBOOK"
if [ -n "$staged" ]; then
  mode=$(git ls-files -s -- "$RULEBOOK" | awk '{ print $1 }')
  blob=$(git show ":$RULEBOOK" | bump | git hash-object -w --stdin)
  git update-index --cacheinfo "$mode,$blob,$RULEBOOK"
fi

echo "rulebook changed: Rules version raised $before -> $next"
