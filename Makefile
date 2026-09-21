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

.PHONY: help build check app app-check app-install sheet all
default: build

help:
	@echo "make build   regenerate the generated card modules from design/cards.yaml"
	@echo "make check   fail if a generated card module is stale or the card sheet stops printing it"
	@echo "make app        run the web game's dev server (an alias for bin/nvu web)"
	@echo "make app-check  lint, typecheck and test the web game, the sim and the CLI"
	@echo "bin/nvu         the CLI: bin/nvu play, bin/nvu replay, bin/nvu fuzz, bin/nvu help"
	@echo "make sheet   open the print-and-cut card sheet in a browser"
	@echo ""
	@echo "Change a card in design/cards.yaml, then: make build check"

build: tools/cards.js

# Regenerating is cheap, so cards.js is rebuilt whenever the source is newer.
tools/cards.js: design/cards.yaml tools/cards.mjs
	node tools/cards.mjs build

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
app/node_modules: app/package.json
	cd app && npm install
	@touch app/node_modules

app-install: app/node_modules

app: app/node_modules build
	bin/nvu web

app-check: app/node_modules build
	cd app && npm run check

# The print-and-cut card sheet, for playing on a table (tools/card-sheet.html).
sheet: build
	open tools/card-sheet.html

all: check app-check
