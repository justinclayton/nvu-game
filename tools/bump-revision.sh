#!/bin/sh
# Raises the two kit revision counters when their source changed since the
# branch left main and the counter is not already above main's:
#
#   R   rulebook.md    the "Rules version: R<n>" line
#   C   cards.yaml     the "version: C<n>" line under meta
#
# Run through `make bump-revision`, which the pre-commit hook, CI and a person
# after a merge all use. design/loop/spec.md names the counters.
#
# It edits only the two sources. When a source is staged it judges and edits
# the staged copy too, leaving unstaged edits unstaged. Rebuilding the
# generated card modules, which stamp the counters, is the caller's job.
#
# POSIX sh and no GNU-only flags, so it runs the same on macOS and Linux.
set -eu
cd "$(dirname "$0")/.."

main=
for ref in origin/main main; do
  if git rev-parse --verify --quiet "$ref" >/dev/null; then main=$ref; break; fi
done
base=$([ -n "$main" ] && git merge-base HEAD "$main" || true)
[ -n "$base" ] || { echo "no main to compare the sources against"; exit 0; }

# bump_counter <file> <letter> <sed pattern for the line's prefix>
#   The counter is <letter><digits> right after the prefix. A base copy without
#   the counter (the 0.2.x days) counts as 0, so the first stamping is "above".
bump_counter() {
  file=$1; letter=$2; prefix=$3
  base_id=$(git rev-parse --verify --quiet "$base:$file") || {
    echo "$file: not on main yet, nothing to compare"; return 0
  }
  value_of() { sed -n "s/^$prefix$letter\([0-9][0-9]*\).*/\1/p" | head -n 1; }

  if git diff --cached --name-only -- "$file" | grep -q .; then
    staged=1
    current_id=$(git rev-parse ":$file")
    after=$(git show ":$file" | value_of)
  else
    staged=
    current_id=$(git hash-object "$file")
    after=$(value_of < "$file")
  fi
  before=$(git show "$base:$file" | value_of)
  before=${before:-0}
  after=${after:-0}

  if [ "$current_id" = "$base_id" ] || [ "$after" -gt "$before" ]; then
    echo "$file: $letter counter already raised, or the file is unchanged ($letter$after)"
    return 0
  fi

  if ! grep -q "^$prefix$letter[0-9]" "$file"; then
    echo "$file: has no $letter counter line to raise" >&2
    return 1
  fi
  next=$((before + 1))
  bump() { sed "s/^\($prefix\)$letter[0-9]*/\1$letter$next/"; }

  tmp=$(mktemp)
  bump < "$file" > "$tmp"
  cat "$tmp" > "$file"
  rm -f "$tmp"
  if [ -n "$staged" ]; then
    mode=$(git ls-files -s -- "$file" | awk '{ print $1 }')
    blob=$(git show ":$file" | bump | git hash-object -w --stdin)
    git update-index --cacheinfo "$mode,$blob,$file"
  fi
  echo "$file changed: $letter counter raised $letter$before -> $letter$next"
}

bump_counter rulebook.md R 'Rules version:[[:space:]]*'
bump_counter cards.yaml C '  version:[[:space:]]*'
