# North vs Up
#
# design/cards.yaml is the one place a card is written down. Everything that
# shows a card is generated from it or checked against it.
#
#   make            what each target does
#   make build      regenerate prototype/cards.js from design/cards.yaml
#   make check      fail if anything has drifted from the card list
#   make sweep      run the headless parameter sweep over the simulator
#   make sheet      open the print-and-cut card sheet
#   make sim        open the encounter simulator

.PHONY: help build check sweep sheet sim rules-core rules-core-check all
default: build

help:
	@echo "make build   regenerate prototype/cards.js from design/cards.yaml"
	@echo "make check   fail if cards.js is stale or a prototype stops rendering it"
	@echo "make sweep   run the headless parameter sweep over the simulator"
	@echo "make sheet   open the print-and-cut card sheet in a browser"
	@echo "make sim     open the encounter simulator in a browser"
	@echo "make rules-core        build and open the TypeScript rules-core prototype"
	@echo "make rules-core-check  run its seeded smoke run and walkthrough check"
	@echo ""
	@echo "Change a card in design/cards.yaml, then: make build check"

build: prototype/cards.js

# Regenerating is cheap, so cards.js is rebuilt whenever the source is newer.
prototype/cards.js: design/cards.yaml tools/cards.mjs
	node tools/cards.mjs build

check: build
	node tools/cards.mjs check

sweep: build
	node prototype/sim-sweep.js

sheet: build
	open prototype/card-sheet.html

sim: build
	open prototype/encounter-sim.html

# The rules-core prototype (throwaway; see prototype/rules-core-ts/README.md).
# Node strips the TypeScript itself, so there is still nothing to install.
prototype/rules-core-demo.html: prototype/cards.js prototype/rules-core-ts/*.ts prototype/rules-core-ts/build.mjs
	node prototype/rules-core-ts/build.mjs

rules-core: prototype/rules-core-demo.html
	open prototype/rules-core-demo.html

rules-core-check: prototype/rules-core-demo.html
	node prototype/rules-core-ts/smoke.ts
	node prototype/rules-core-ts/verify.mjs

all: check sweep
