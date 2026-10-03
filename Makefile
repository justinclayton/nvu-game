# North vs Up
#
# design/cards.yaml is the one place a card is written down. Everything that
# shows a card is generated from it or checked against it.
#
#   make            what each target does
#   make build      regenerate the generated card modules from design/cards.yaml
#   make check      fail if anything has drifted from the card list
#   make app        run the web game's dev server (an alias for bin/nvu web)
#   make app-check  lint, typecheck and test the web game, the sim and the CLI
#   bin/nvu         the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu help
#   make sheet      open the print-and-cut card sheet
#   make pdf        print the sheet to print/card-sheet-v<rules version>.pdf
#   make rulebook   print the rulebook to print/rulebook-v<rules version>.pdf

.PHONY: help build check app app-check app-install sheet pdf rulebook all
default: build

help:
	@echo "make build   regenerate the generated card modules from design/cards.yaml"
	@echo "make check   fail if a generated card module is stale or the card sheet stops printing it"
	@echo "make app        run the web game's dev server (an alias for bin/nvu web)"
	@echo "make app-check  lint, typecheck and test the web game, the sim and the CLI"
	@echo "bin/nvu         the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu help"
	@echo "make sheet   open the print-and-cut card sheet in a browser"
	@echo "make pdf     print the sheet to print/card-sheet-v<rules version>.pdf (needs Chrome)"
	@echo "make rulebook  print the rulebook to print/rulebook-v<rules version>.pdf (needs Chrome)"
	@echo ""
	@echo "Change a card in design/cards.yaml, then: make build check"

build: tools/cards.js

# Regenerating is cheap, so cards.js is rebuilt whenever a source is newer.
# The rulebook is one: its rules version is stamped on every printed card.
tools/cards.js: design/cards.yaml design/rulebook.md tools/cards.mjs
	node tools/cards.mjs build

# `make check` also runs the app's content drift test when app/ is installed;
# on a fresh clone the generator's own check still stands on its own.
check: build
	node tools/cards.mjs check
	node tools/check-rules-version.mjs
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
# Worktrees share this setting, so one install covers them all.
app-install: app/node_modules
	git config core.hooksPath .githooks

app: app/node_modules build
	bin/nvu web

app-check: app/node_modules build
	cd app && npm run check

# The print-and-cut card sheet, for playing on a table (tools/card-sheet.html).
sheet: build
	open tools/card-sheet.html

# PDFs, named for the rules version they were printed under.  Headless Chrome
# does the printing; CHROME=/path/to/chrome overrides the search.
RULES_VERSION = $(shell sed -n 's/^Rules version:[[:space:]]*//p' design/rulebook.md)
PDF = print/card-sheet-v$(RULES_VERSION).pdf
RULEBOOK_HTML = print/rulebook-v$(RULES_VERSION).html
RULEBOOK_PDF = print/rulebook-v$(RULES_VERSION).pdf

# print_pdf <page.html> <out.pdf>
define print_pdf
	chrome="$(CHROME)"; \
	for c in "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
	         "/Applications/Chromium.app/Contents/MacOS/Chromium" \
	         google-chrome chromium chromium-browser; do \
		[ -n "$$chrome" ] && break; \
		if [ -x "$$c" ] || command -v "$$c" >/dev/null 2>&1; then chrome="$$c"; fi; \
	done; \
	if [ -z "$$chrome" ]; then echo "make $@: no Chrome found; set CHROME=/path/to/chrome" >&2; exit 1; fi; \
	mkdir -p print; \
	"$$chrome" --headless=new --disable-gpu --no-pdf-header-footer \
		--print-to-pdf="$(CURDIR)/$(2)" "file://$(CURDIR)/$(1)" 2>/dev/null; \
	echo "wrote $(2)"
endef

# The card sheet.
pdf: build
	@$(call print_pdf,tools/card-sheet.html,$(PDF))

# The rulebook (design/rulebook.md), laid out by tools/rulebook.mjs.
rulebook:
	@node tools/rulebook.mjs $(RULEBOOK_HTML)
	@$(call print_pdf,$(RULEBOOK_HTML),$(RULEBOOK_PDF))

all: check app-check
