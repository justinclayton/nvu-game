#!/bin/sh
# Is the checked-out commit stale? It is when a push skipped the hooks, from
# the GitHub web editor or the "Update branch" button:
#
#   - rulebook.md or cards.yaml differs from <before>, the branch tip before
#     the push, and its R or C is not above that tip's. A merge commit is not
#     held to this, nor is the first push of a branch.
#   - rulebook.md or cards.yaml differs from main and its R or C is not above
#     main's.
#   - tools/cards.js or app/src/content/cards.generated.ts is stale.
#
#   sh tools/stale-kit.sh [<before>]
#
# Exits 0 when nothing is stale. Exits 1 when something is, leaving the fix
# (R or C raised, the card modules rebuilt) in the working tree. kit-fix.yml
# commits that fix; loop.yml and source-pr.yml stop on it.
set -eu
cd "$(dirname "$0")/.."

[ -n "$(git status --porcelain)" ] && { echo "the working tree is not clean" >&2; exit 2; }

last=HEAD
before=${1:-}
parents=$(git rev-list --parents -n 1 HEAD | wc -w)
if [ "$parents" -gt 2 ]; then
  echo "HEAD is a merge commit: judging it against main only"
elif [ -n "$before" ] && git rev-parse --verify --quiet "$before^{commit}" >/dev/null; then
  last=$before
fi

KIT_LAST=$last sh tools/bump-revision.sh
node tools/cards.mjs build >/dev/null

if git diff --quiet; then
  echo "the kit revision and the card modules are up to date"
  exit 0
fi
echo "stale:"
git diff --stat
exit 1
