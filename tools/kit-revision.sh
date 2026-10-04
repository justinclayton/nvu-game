#!/bin/sh
# Prints the kit revision, the name of one playable state of the game:
#
#   R29.C43-v1
#
#   R   rulebook changes, from the "Rules version: R<n>" line in rulebook.md
#   C   card list changes, from the "version: C<n>" line under meta in cards.yaml
#   v   engine changes since R or C last changed, counted from git: 1 for the
#       engine as it stood when either counter last changed, plus one per later
#       non-merge commit touching app/ other than the generated card module.
#
# The CLI, the run file, the playtest note and the print sheet stamp what this
# prints, and the web build bakes it in. See design/loop/spec.md, Kit revision.
# With --sources it prints only the stored part, R29.C43, which needs no git.
set -eu
cd "$(dirname "$0")/.."

r=$(sed -n 's/^Rules version:[[:space:]]*\(R[0-9][0-9]*\).*/\1/p' rulebook.md | head -n 1)
c=$(sed -n 's/^  version:[[:space:]]*\(C[0-9][0-9]*\).*/\1/p' cards.yaml | head -n 1)
[ -n "$r" ] || { echo 'rulebook.md has no "Rules version: R<n>" line' >&2; exit 1; }
[ -n "$c" ] || { echo 'cards.yaml has no "version: C<n>" line under meta' >&2; exit 1; }

if [ "${1:-}" = "--sources" ]; then
  echo "$r.$c"
  exit 0
fi

# The engine commits since a counter last changed. Each counter's last change
# is a candidate base; the later one (the one with fewer commits after it)
# starts the count. A clone without history, or one from before the counters
# existed, counts from the last commit that touched the source at all.
engine_commits_since() {
  git rev-list --count --no-merges "$1..HEAD" -- app/ ':!app/src/content/cards.generated.ts'
}
v=1
if git rev-parse --verify --quiet HEAD >/dev/null 2>&1; then
  least=
  for pair in "rulebook.md|^Rules version:" "cards.yaml|^  version:"; do
    file=${pair%%|*}; line=${pair#*|}
    base=$(git log -1 --format=%H -G"$line" -- "$file" 2>/dev/null || true)
    [ -n "$base" ] || base=$(git log -1 --format=%H -- "$file" 2>/dev/null || true)
    [ -n "$base" ] || continue
    n=$(engine_commits_since "$base")
    if [ -z "$least" ] || [ "$n" -lt "$least" ]; then least=$n; fi
  done
  v=$((1 + ${least:-0}))
fi

echo "$r.$c-v$v"
