# North vs Up
#
# design/cards.yaml is the one place a card is written down. Everything that
# shows a card is generated from it or checked against it.
#
#   make            what each target does
#   make build      regenerate the generated card modules from design/cards.yaml
#   make check      fail if anything has drifted from the card list
#   make app        run the web game's dev server
#   make app-check  lint, typecheck and test the web game
#   make sim        simulate runs in the terminal with the same engine (ARGS="...")
#   make play       play a run in the terminal
#   make sheet      open the print-and-cut card sheet

.PHONY: help build check app app-check app-install sim play sheet all
default: build

help:
	@echo "make build   regenerate the generated card modules from design/cards.yaml"
	@echo "make check   fail if a generated card module is stale or the card sheet stops printing it"
	@echo "make app        run the web game's dev server"
	@echo "make app-check  lint, typecheck and test the web game"
	@echo "make sim        simulate runs in the terminal; e.g. make sim ARGS=\"sim --games 500 --policy random\""
	@echo "make play       play a run in the terminal (make play ARGS=\"--seed 7\")"
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
	cd app && npm run dev

app-check: app/node_modules build
	cd app && npm run check

# The CLI simulator (app/src/cli, app/src/sim). See design/cli-sim/spec.md.
sim: app/node_modules build
	cd app && npm run --silent sim -- $(or $(ARGS),sim)

play: app/node_modules build
	cd app && npm run --silent play -- $(ARGS)

# The print-and-cut card sheet, for playing on a table (tools/card-sheet.html).
sheet: build
	open tools/card-sheet.html

all: check app-check
