#!/bin/sh
# Scripted check of the generated-file merge setup (.gitattributes, the
# cards-generated merge driver, .githooks/pre-merge-commit) in a throwaway clone.
# Run from the repo root: sh tools/test-merge-driver.sh
set -eu
root=$(pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone -q "$root" "$tmp/r"
cd "$tmp/r"
# carry over the working tree's version of the files under test
cp "$root/.gitattributes" .; mkdir -p .githooks; cp "$root"/.githooks/* .githooks/
git config user.email t@t; git config user.name t
git config core.hooksPath .githooks
git config merge.cards-generated.driver true
git add -A; git commit -qm base --no-verify
base=$(git rev-parse --abbrev-ref HEAD)

# a card flavor line, to edit in two ways
edit() { # $1 = nth flavor line, $2 = suffix
  awk -v n="$1" -v s="$2" '/^ *flavor:/ { if (++c == n) $0 = $0 s } { print }' cards.yaml > y.tmp && mv y.tmp cards.yaml
}

echo "== case 1: two branches edit different cards =="
git checkout -qb a "$base"; edit 3 " A"; node tools/cards.mjs build >/dev/null; git add -A; git commit -qm a
git checkout -qb b "$base"; edit 9 " B"; node tools/cards.mjs build >/dev/null; git add -A; git commit -qm b
git merge -q a -m "merge a into b" 2>/dev/null && { echo "FAIL: stale modules committed"; exit 1; }
echo "merge refused once, modules regenerated and staged; no conflict, no hand edit"
git commit -q --no-edit && echo "second git commit finishes the merge"
test -z "$(git status --short)" && echo "PASS: clean tree, generated files in the merge commit"
node tools/cards.mjs check >/dev/null && echo "PASS: merged result passes cards check"

echo "== case 2: both branches edit the same card =="
git checkout -qb c "$base"; edit 3 " C"; node tools/cards.mjs build >/dev/null; git add -A; git commit -qm c
if git merge -q a -m "merge a into c"; then echo "FAIL: merge should have stopped"; exit 1; fi
echo "merge stopped for a person (conflict in cards.yaml)"
if git commit -qm "merge" 2>/dev/null; then echo "FAIL: commit allowed with conflict"; exit 1; fi
echo "PASS: no commit while cards.yaml is conflicted"
