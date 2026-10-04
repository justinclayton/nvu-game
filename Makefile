# North vs Up
#
# cards.yaml is the one place a card is written down. Everything that
# shows a card is generated from it or checked against it.
#
#   make            what each target does
#   make build      regenerate the generated card modules from cards.yaml
#   make check      fail if anything has drifted from the card list
#   make app        run the web game's dev server (an alias for bin/nvu web)
#   make app-check  lint, typecheck and test the web game, the sim and the CLI
#   bin/nvu         the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu help
#   make sheet      open the print-and-cut card sheet
#   make revision   print the kit revision, R29.C43-v1 (tools/kit-revision.sh)
#   make pdf        create the card sheet PDF, fronts and backs, print/card-sheet-R29.C43.pdf
#   make rulebook   create the rulebook PDF, print/rulebook-R29.C43.pdf

.PHONY: help build check bump-revision bump-rules-version revision app app-check app-install sheet pdf rulebook all
default: build

help:
	@echo "make build   regenerate the generated card modules from cards.yaml"
	@echo "make check   fail if a generated card module is stale or the card sheet stops printing it"
	@echo "make app        run the web game's dev server (an alias for bin/nvu web)"
	@echo "make app-check  lint, typecheck and test the web game, the sim and the CLI"
	@echo "bin/nvu         the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu help"
	@echo "make revision   print the kit revision, R29.C43-v1"
	@echo "make sheet   open the print-and-cut card sheet in a browser"
	@echo "make pdf     create the card sheet PDF, fronts and backs, print/card-sheet-R29.C43.pdf"
	@echo "make rulebook  create the rulebook PDF, print/rulebook-R29.C43.pdf"
	@echo ""
	@echo "Change a card in cards.yaml, then: make build check"

build: tools/cards.js

# Regenerating is cheap, so cards.js is rebuilt whenever a source is newer.
# The rulebook is one: its rules version is stamped on every printed card.
tools/cards.js: cards.yaml rulebook.md tools/cards.mjs
	node tools/cards.mjs build

# Raise R or C if the rulebook or the card list changed without one, then
# rebuild the generated card modules that stamp them. The pre-commit hook and
# CI run it too; run it yourself after a merge that touched either source.
# bump-rules-version is the old name, kept for muscle memory.
bump-revision bump-rules-version:
	sh tools/bump-revision.sh
	node tools/cards.mjs build

# The kit revision: R and C from the sources, the engine count from git.
revision:
	@sh tools/kit-revision.sh

# `make check` also runs the app's content drift test when app/ is installed;
# on a fresh clone the generator's own check still stands on its own.
check: build
	node tools/cards.mjs check
	@if [ -d app/node_modules ]; then \
		cd app && npx vitest run src/content; \
	else \
		echo "app/ not installed — skipping the content drift test (run: make app-install)"; \
	fi

# The web game (app/). See design/web-game/spec.md.
# npm ci installs exactly what package-lock.json pins and never rewrites it;
# npm install would, with any npm older or newer than the one that wrote it.
app/node_modules: app/package.json app/package-lock.json
	cd app && npm ci
	@touch app/node_modules

# Also turns on .githooks/pre-commit, which refuses a commit while the card
# list has drifted or the rulebook changed without a higher Rules version.
# Also registers the merge driver .gitattributes names for the generated card
# modules: it keeps our side, and .githooks/pre-merge-commit regenerates them.
# Worktrees share these settings, so one install covers them all.
app-install: app/node_modules
	git config core.hooksPath .githooks
	git config merge.cards-generated.driver true

app: app/node_modules build
	bin/nvu web

app-check: app/node_modules build
	cd app && npm run check

# The print-and-cut card sheet, for playing on a table (tools/card-sheet.html).
sheet: build
	open tools/card-sheet.html

# The printable kit's PDFs, named for R and C, the counters printed on the
# cards. The engine count is left off because nothing printed depends on it.
# On a merge to main that changes either source, .github/workflows/printable-kit.yml
# runs these on the self-hosted runner and publishes them as a release.
# tools/find-chrome.sh finds the headless Chrome that renders them, fetching one
# into a cache if none is installed; CHROME=/path/to/chrome overrides it.
KIT = $(shell sh tools/kit-revision.sh --sources)
PDF = print/card-sheet-$(KIT).pdf
RULEBOOK_HTML = print/rulebook-$(KIT).html
RULEBOOK_PDF = print/rulebook-$(KIT).pdf

# print_pdf <page.html> <out.pdf>
define print_pdf
	chrome=$$(sh tools/find-chrome.sh) || exit 1; \
	mkdir -p print; \
	"$$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
		--print-to-pdf="$(CURDIR)/$(2)" "file://$(CURDIR)/$(1)" 2>/dev/null; \
	test -s "$(2)" || { echo "make $@: Chrome wrote no $(2)" >&2; exit 1; }; \
	echo "wrote $(2)"
endef

# The card sheet.
pdf: build
	@$(call print_pdf,tools/card-sheet.html,$(PDF))

# The rulebook (rulebook.md), laid out by tools/rulebook.mjs.
rulebook:
	@node tools/rulebook.mjs $(RULEBOOK_HTML)
	@$(call print_pdf,$(RULEBOOK_HTML),$(RULEBOOK_PDF))

all: check app-check
