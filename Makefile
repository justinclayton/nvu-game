# North vs Up
#
# design/cards.yaml is the one place a card is written down. Everything that
# shows a card is generated from it or checked against it (ticket 25).
#
#   make            what each target does
#   make build      regenerate prototype/cards.js from design/cards.yaml
#   make check      fail if anything has drifted from the card list
#   make sweep      run the headless parameter sweep over the simulator
#   make sheet      open the print-and-cut card sheet
#   make sim        open the encounter simulator

.PHONY: help build check sweep sheet sim all

help:
	@echo "make build   regenerate prototype/cards.js from design/cards.yaml"
	@echo "make check   fail if cards.js is stale, if either prose file disagrees"
	@echo "             with the card list, or if a prototype stops rendering it"
	@echo "make sweep   run the headless parameter sweep over the simulator"
	@echo "make sheet   open the print-and-cut card sheet in a browser"
	@echo "make sim     open the encounter simulator in a browser"
	@echo ""
	@echo "Change a card in design/cards.yaml, then: make build check"

# Regenerating is cheap, so cards.js is rebuilt whenever the source is newer.
prototype/cards.js: design/cards.yaml tools/cards.mjs
	node tools/cards.mjs build

build: prototype/cards.js

check: build
	node tools/cards.mjs check

sweep: build
	node prototype/sim-sweep.js

sheet: build
	open prototype/12-exemplar-cards.html

sim: build
	open prototype/encounter-sim.html

all: check sweep
