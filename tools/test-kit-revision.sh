#!/bin/sh
# Scripted check of the kit revision scripts (tools/bump-revision.sh,
# tools/kit-revision.sh) in a throwaway clone with its own "main".
# Run from the repo root: sh tools/test-kit-revision.sh
set -eu
root=$(pwd)
tmp=$(mktemp -d)
trap 'rm -rf "$tmp"' EXIT
git clone -q "$root" "$tmp/r"
cd "$tmp/r"
# carry over the working tree's version of the files under test
cp "$root"/tools/bump-revision.sh "$root"/tools/kit-revision.sh "$root"/tools/stale-kit.sh tools/
cp "$root"/rulebook.md "$root"/cards.yaml .
git config user.email t@t; git config user.name t
git checkout -q --orphan base
git add -A; git commit -qm base --no-verify
git branch -f main HEAD
git remote remove origin

fail() { echo "FAIL: $*"; exit 1; }
expect() { # $1 = want, $2 = got, $3 = what
  [ "$1" = "$2" ] || fail "$3: wanted '$1', got '$2'"
  echo "ok   $3: $2"
}
r0=$(sed -n 's/^Rules version:[[:space:]]*R\([0-9]*\).*/\1/p' rulebook.md)
c0=$(sed -n 's/^  version:[[:space:]]*C\([0-9]*\).*/\1/p' cards.yaml)
touch_engine() { echo "// $1" >> app/src/sim/moves.ts; git commit -qam "engine: $1" --no-verify; }

echo "== on main, nothing to bump =="
sh tools/bump-revision.sh >/dev/null
expect "R$r0.C$c0-v1" "$(sh tools/kit-revision.sh)" "fresh counters are v1"
expect "R$r0.C$c0" "$(sh tools/kit-revision.sh --sources)" "--sources leaves v out"

echo "== engine commits count up, merges do not =="
git checkout -qb engine main
touch_engine one; touch_engine two
expect "R$r0.C$c0-v3" "$(sh tools/kit-revision.sh)" "two engine commits make v3"
git checkout -q main; git merge -q --no-ff engine -m "merge engine" --no-verify
expect "R$r0.C$c0-v3" "$(sh tools/kit-revision.sh)" "the merge commit does not count"
echo "// generated" >> app/src/content/cards.generated.ts; git commit -qam "regen" --no-verify
expect "R$r0.C$c0-v3" "$(sh tools/kit-revision.sh)" "the generated module does not count"

echo "== every rulebook commit raises R and resets v =="
git checkout -qb rules main
echo "" >> rulebook.md; echo "A new line." >> rulebook.md
sh tools/bump-revision.sh | grep -q "R$r0 -> R$((r0 + 1))" || fail "R not raised"
sh tools/bump-revision.sh | grep -q "already raised" || fail "R raised twice for one edit"
git commit -qam "rules edit" --no-verify
expect "R$((r0 + 1)).C$c0-v1" "$(sh tools/kit-revision.sh)" "R raised, v back to 1"
sh tools/bump-revision.sh | grep -q "already raised" || fail "R raised with nothing edited"
touch_engine three
expect "R$((r0 + 1)).C$c0-v2" "$(sh tools/kit-revision.sh)" "an engine commit after the bump is v2"
echo "Another line." >> rulebook.md
sh tools/bump-revision.sh | grep -q "R$((r0 + 1)) -> R$((r0 + 2))" || fail "a second edit on the branch did not raise R"
git commit -qam "rules edit 2" --no-verify
expect "R$((r0 + 2)).C$c0-v1" "$(sh tools/kit-revision.sh)" "a second edit names a new state, v back to 1"

echo "== a card edit raises C, on the staged copy too =="
git checkout -qb cards main
awk '/^ *flavor:/ && !done { $0 = $0 " (edited)"; done = 1 } { print }' cards.yaml > y.tmp && mv y.tmp cards.yaml
git add cards.yaml
echo "unstaged" >> cards.yaml
sh tools/bump-revision.sh | grep -q "C$c0 -> C$((c0 + 1))" || fail "C not raised"
git show :cards.yaml | grep -q "^  version: C$((c0 + 1))" || fail "staged copy not raised"
git show :cards.yaml | grep -q "^unstaged" && fail "unstaged edit leaked into the index"
grep -q "^  version: C$((c0 + 1))" cards.yaml || fail "working copy not raised"
echo "ok   C raised in the index and the working tree, unstaged edit left alone"
git checkout -q -- cards.yaml 2>/dev/null || true
git commit -qm "card edit" --no-verify
expect "R$r0.C$((c0 + 1))-v1" "$(sh tools/kit-revision.sh)" "C raised, v back to 1"

echo "== two branches reach the same R: the second is raised again after merging main =="
git checkout -qb rules-once main
echo "" >> rulebook.md; echo "One rule edit." >> rulebook.md
sh tools/bump-revision.sh >/dev/null; git commit -qam "rules once" --no-verify
git checkout -q main; git merge -q --no-ff rules-once -m "merge rules-once" --no-verify
git checkout -q cards; echo "Card branch rule." >> rulebook.md; git commit -qam "rules on cards branch" --no-verify
sh tools/bump-revision.sh >/dev/null; git commit -qam "bump" --no-verify
expect "R$((r0 + 1))" "$(sh tools/kit-revision.sh --sources | cut -d. -f1)" "both branches at the same R"
# the appended lines conflict; keep both sides, as a person would
git merge -q main -m "merge main" --no-verify >/dev/null 2>&1 || {
  sed '/^<<<<<<< /d; /^=======$/d; /^>>>>>>> /d' rulebook.md > r.tmp && mv r.tmp rulebook.md
  git add -A; git commit -qm "merge main" --no-verify
}
sh tools/bump-revision.sh | grep -q "R$((r0 + 1)) -> R$((r0 + 2))" || fail "R not raised past main after the merge"
echo "ok   R raised past main after merging"

echo "== pushes that skipped the hooks are stale, the fix and hooked pushes are not =="
gen="tools/cards.js app/src/content/cards.generated.ts"
git reset -q --hard; git checkout -q main
node tools/cards.mjs build >/dev/null; git commit -qam "main rebuilt" --no-verify || true
cmain=$(sed -n 's/^  version:[[:space:]]*C\([0-9]*\).*/\1/p' cards.yaml)
c_now() { sed -n 's/^  version:[[:space:]]*C\([0-9]*\).*/\1/p' cards.yaml; }
edit_card() { awk -v t="$1" '/^ *flavor:/ && !done { $0 = $0 " " t; done = 1 } { print }' cards.yaml > y.tmp && mv y.tmp cards.yaml; }
git checkout -qb web main
edit_card "(web one)"; git commit -qam "web edit one" --no-verify
sh tools/stale-kit.sh 0000000000000000000000000000000000000000 >/dev/null && fail "a new branch's web edit was not stale"
expect "$((cmain + 1))" "$(c_now)" "a web edit raises C past main"
git diff --quiet -- $gen && fail "the card modules were not rebuilt"
git commit -qam "fix" --no-verify
before=$(git rev-parse HEAD~1)
sh tools/stale-kit.sh "$before" >/dev/null || fail "the fix commit was judged stale"
echo "ok   the fix commit is not stale"
before=$(git rev-parse HEAD)
edit_card "(web two)"; git commit -qam "web edit two" --no-verify
sh tools/stale-kit.sh "$before" >/dev/null && fail "a second web edit was not stale"
expect "$((cmain + 2))" "$(c_now)" "a second web edit raises C again"
git commit -qam "fix two" --no-verify
before=$(git rev-parse HEAD)
edit_card "(hooked)"; sh tools/bump-revision.sh >/dev/null; node tools/cards.mjs build >/dev/null
git commit -qam "hooked edit" --no-verify
sh tools/stale-kit.sh "$before" >/dev/null || fail "a hooked push was judged stale"
echo "ok   a hooked push is not stale"
git checkout -q main
echo "Main rule." >> rulebook.md; sh tools/bump-revision.sh >/dev/null; node tools/cards.mjs build >/dev/null
git commit -qam "main rules edit" --no-verify
git checkout -q web
before=$(git rev-parse HEAD)
git merge -q --no-commit main >/dev/null 2>&1 || true
git checkout HEAD -- $gen; git commit -qm "Update branch" --no-verify
sh tools/stale-kit.sh "$before" >/dev/null && fail "an Update branch merge with stale modules was not stale"
expect "app/src/content/cards.generated.ts tools/cards.js" "$(git diff --name-only | tr '\n' ' ' | sed 's/ $//')" "the merge gets only the card modules rebuilt"
git commit -qam "fix merge" --no-verify
before=$(git rev-parse HEAD)
rnow=$(sed -n 's/^Rules version:[[:space:]]*R\([0-9]*\).*/\1/p' rulebook.md)
echo "Web rule." >> rulebook.md; git commit -qam "web rules edit" --no-verify
sh tools/stale-kit.sh "$before" >/dev/null && fail "a web rulebook edit was not stale"
grep -q "^Rules version: R$((rnow + 1))" rulebook.md || fail "a web rulebook edit did not raise R"
echo "ok   a web rulebook edit raises R"
git commit -qam "fix rules" --no-verify

echo "PASS"
