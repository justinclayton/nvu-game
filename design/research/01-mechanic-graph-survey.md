# 01 — Mechanic graphs: how others have drawn how mechanics connect

Unticketed background research, requested directly. The question: when people have drawn
a game's mechanics as a graph (mechanics as nodes, their connections as edges), what did
they call the nodes, what kinds of edge did they allow, and what was the drawing for?
Nothing here is applied to North vs Up. That is a separate step.

**Provenance.** Sections 1 to 9 report what the cited sources say. Each claim carries a
[TAG] into the Sources table. The last section, "Synthesis (agent-proposed)", is my own
comparison across the sources and makes no claim any single source makes. The Gaps section
lists what I could not read.

**Source quality warning.** Most sources were read from the primary document (the paper,
the author's slides, the official docs, or a text dump of the author's own deck). Three
were not. The Dormans 2009 paper was read from a GitHub gist that claims to be a copy of it
[DORM-09]. The Björk and Holopainen 2005 book could not be fetched, so the relation
vocabulary for that tradition comes from the 2003 paper [BLH-03] and the live wiki
[GDP-WIKI], not the book. The Dormans PhD thesis and the Koster book were not read (the
thesis PDF is 18 MB and the fetch tool refused it). The Cousins 2004 article is posted only
as page scans and could not be read. Where a section leans on those, it says so.

## Sources

| Tag | Document | Class |
|---|---|---|
| **[MACH-DOC]** | Machinations official docs, gitbook: `https://machinations.gitbook.io/docs/` (pages read: `connections/resource-connections`, `connections/state-connections`, `connections/state-connections/label-modifiers`, `.../node-modifiers`, `.../triggers`, `.../activators`, `converters-and-traders`, `gates`, `delays-and-queues`, `end-conditions`, `registers`, `nodes-properties/activation-modes`, `basic-nodes`, `basic-nodes/pools`) | Tier 1, official docs |
| **[DORM-09]** | Dormans, *Machinations: Elemental Feedback Patterns for Game Design*, GAMEON-NA 2009, read from a gist copy: `https://gist.github.com/kengonakajima/5073347` | Tier 3 copy of a Tier 1 paper |
| **[ADAMS-12]** | Adams, *The Designer's Notebook: Machinations, A New Way to Design Game Mechanics*, Game Developer, 16 Aug 2012: `https://www.gamedeveloper.com/design/the-designer-s-notebook-machinations-a-new-way-to-design-game-mechanics` | Tier 1, co-author of the Machinations book |
| **[MACH-ART]** | Machinations.io, *Game systems: Feedback loops and how they help craft player experiences*: `https://machinations.io/articles/game-systems-feedback-loops-and-how-they-help-craft-player-experiences` | Tier 2, vendor article |
| **[BLH-03]** | Björk, Lundgren, Holopainen, *Game Design Patterns*, DiGRA 2003: `https://www.cp.eng.chula.ac.th/~vishnu/gameResearch/design/game-design-patterns.pdf` | Tier 1 |
| **[GDP-WIKI]** | Gameplay Design Patterns wiki (Björk and Holopainen), pages `Main_Page`, `Cards`, `Resources`: `http://virt10.itu.chalmers.se/index.php/` (HTTP only; HTTPS refuses) | Tier 1, maintained by the authors |
| **[LEE-20]** | Lee, Holopainen, Christian, *Making Sense of the Gameplay Design Pattern Collection*, DiGRA 2020 abstract: `https://dl.digra.org/index.php/dl/article/download/1293/1293/1290` | Tier 1 |
| **[COOK-07]** | Cook, *The Chemistry of Game Design*, Game Developer (Gamasutra), July 2007: `https://www.gamedeveloper.com/design/the-chemistry-of-game-design` | Tier 1 |
| **[MDA-04]** | Hunicke, LeBlanc, Zubek, *MDA: A Formal Approach to Game Design and Game Research*, 2004: `https://users.cs.northwestern.edu/~hunicke/MDA.pdf` | Tier 1 |
| **[KOST-05]** | Koster, *A Grammar of Gameplay: game atoms: can games be diagrammed?*, GDC 2005 slides: `https://www.raphkoster.com/gaming/atof/grammarofgameplay.pdf` | Tier 1 |
| **[KOST-06]** | Koster, *Game Diagrams*, blog, 30 Mar 2006: `https://www.raphkoster.com/2006/03/30/game-diagrams/` | Tier 1 for Koster's words; comments are Tier 3 |
| **[KOST-12]** | Koster, *An atomic theory of fun game design*, blog, 24 Jan 2012: `https://www.raphkoster.com/2012/01/24/an-atomic-theory-of-fun-game-design/` | Tier 1 |
| **[BURA-06]** | Bura, *A Game Grammar*, 2006, archived copy: `https://web.archive.org/web/2007id_/http://www.stephanebura.com/diagrams/` | Tier 1 (archived) |
| **[SMITH-03]** | H. Smith, *Orthogonal Unit Differentiation*, GDC 2003 deck: `http://www.witchboy.net/wp-content/uploads/2009/03/gdc03_oud.ppt` (text strings extracted) | Tier 1 |
| **[SMITH-04]** | R. Smith and H. Smith, *Practical Techniques for Implementing Emergent Gameplay (Would the Real Emergent Gameplay Please Stand Up?)*, GDC 2004 deck: `https://witchboy.net/wp-content/uploads/2009/03/randysmithandharveysmith_gdc_2004.ppt` (text strings extracted) | Tier 1 |
| **[LUDO-10]** | Smith, Nelson, Mateas, *LUDOCORE: A Logical Game Engine for Modeling Videogames*, IEEE CIG 2010: `https://users.soe.ucsc.edu/~amsmith/papers/ieeecig10_ludocore.pdf` | Tier 1 |
| **[CEPT-15]** | Martens, *Ceptre: A Language for Modeling Generative Interactive Systems*, AIIDE 2015: `https://www.cs.cmu.edu/~cmartens/ceptre.pdf` | Tier 1 |
| **[LUDII-21]** | Piette, Stephenson, Soemers, Browne, *General Board Game Concepts*, IEEE CoG 2021: `https://arxiv.org/pdf/2107.01078` | Tier 1 |
| **[LUDII-WEB]** | Ludii concept browser: `https://ludii.games/searchConcepts.php` | Tier 1, official |
| **[LUDII-23]** | Stephenson, Soemers, Piette, Browne, *Measuring Board Game Distance*, CG 2022, abstract only: `https://arxiv.org/abs/2301.03913` | Tier 1 (abstract) |
| **[NX]** | NetworkX reference docs: `degree_centrality`, `betweenness_centrality`, `strongly_connected_components`, `articulation_points`, `bipartite` under `https://networkx.org/documentation/stable/reference/algorithms/` | Tier 1 |
| **[DOT]** | Graphviz, *The DOT Language*: `https://graphviz.org/doc/info/lang.html` | Tier 1 |
| **[MERM]** | Mermaid, *Flowcharts*: `https://mermaid.js.org/syntax/flowchart.html` | Tier 1 |
| **[OBS]** | Obsidian help, *Graph view*: `https://obsidian.md/help/plugins/graph` | Tier 1 |
| **[NEO]** | Neo4j, *Getting started: Cypher*: `https://neo4j.com/docs/getting-started/cypher/` | Tier 1 |
| **[DEPC]** | dependency-cruiser README: `https://github.com/sverweij/dependency-cruiser` | Tier 1 |
| **[TSM]** | ts-morph docs: `https://ts-morph.com/` and `https://ts-morph.com/navigation/finding-references` | Tier 1 |
| **[EOM]** | Encyclopedia of Mathematics, *Topological space*: `https://encyclopediaofmath.org/wiki/Topological_space` | Tier 1 |
| **[MW]** | Wolfram MathWorld, *Topology*: `https://mathworld.wolfram.com/Topology.html` | Tier 1 |
| **[CISCO]** | Cisco, *What Is Network Topology?*: `https://www.cisco.com/site/us/en/learn/topics/networking/what-is-network-topology.html` | Tier 2, vendor |
| **[STEN-21]** | Stenseke, *Persistent homology and the shape of evolutionary games*, J. Theor. Biol. 531, 2021, abstract: `https://arxiv.org/abs/2109.14294` | Tier 1 (abstract) |

---

## 1. Machinations (Dormans; Adams and Dormans)

Machinations draws a game's internal economy as a diagram of nodes that hold or move
resources, and runs it as a simulation [ADAMS-12]. The diagram's "state" is the current
distribution of resources over its nodes [MACH-DOC].

**Node types.** The official docs list: pools, which "store Resources"; sources, which
"create Resources"; drains, which "destroy Resources" [MACH-DOC]. Converters "transmute one
or more Resources into another", and when one fires "the total number of Resources in the
game might change" [MACH-DOC]. Traders "cause Resources to change ownership when fired" and
the total stays the same [MACH-DOC]. Gates "either sort Resources without collecting them,
or trigger other Nodes' actions"; they accept and emit both connection kinds [MACH-DOC].
Delays hold resources for a labelled number of time steps; a queue is a delay that handles
one resource at a time [MACH-DOC]. Registers compute a formula over lettered state inputs
and push the result out as state; an interactive register is a slider a person edits during
a run [MACH-DOC]. End conditions "stop Diagram execution" and must be fired by an activator
[MACH-DOC]. The 2009 paper already had pools, sources, drains, converters, and traders
[DORM-09]. Adams' 2012 walkthrough lists the same set plus gates [ADAMS-12].

**Activation modes.** Every node has one of four: automatic ("fires every Time Step"),
interactive (fires when clicked), on start (fires once at run start), and passive (fires
only when triggered) [MACH-DOC]. Pools also choose push or pull [MACH-DOC].

**Connection types.** There are exactly two families. A *resource connection* is a solid
arrow along which resources "move from Node to Node"; its label is the flow rate, default 1,
or `all` [MACH-DOC]. A *state connection* is a dotted arrow from a node to a node, to a
resource connection's label, or to another state connection's label, saying how a change in
the origin's state affects the target [MACH-DOC]. State connections come in four kinds
[MACH-DOC]:

- *Label modifier*: origin node to a target label; the target label moves by the modifier's
  value times the origin's change in state each step (`Lt+1 = Lt + M × ΔS`).
- *Node modifier*: origin node to target node; the target's resource count moves by the
  modifier value times the origin's change (`Nt+1 = Nt + Σ(M × ΔS)`).
- *Trigger* (label `*`): fires the target when "all the inputs of its origin Node become
  satisfied". A *reverse trigger* (label `!`) fires when the origin tries to pull and cannot
  get everything.
- *Activator*: label is a condition such as `==0` or `3-6`; when the origin satisfies it the
  target is "activated (it can fire)", otherwise "inhibited (it cannot fire)".

**Feedback loops.** In the 2009 paper, feedback "is realized by a closed flow of resources
and/or state connections" [DORM-09]. So a loop is found by tracing a cycle through either
family of edge. The paper then classifies each loop on seven characteristics [DORM-09]:
type (positive "enhances differences, destabilizes"; negative "dampens differences,
stabilizes"), effect (constructive or destructive), investment (high or low), return (high,
low, or insufficient), speed (fast or slow), range (short, over few steps, or long, over
many), and durability (none, limited, extended, permanent). The vendor's later article
repeats the positive/negative split with the phrase "the harder you push, the more the
negative feedback loop pushes back" and touches investment, return, speed, range and
durability by example [MACH-ART]. Adams shows the Monopoly upgrade loop drawn with state
connections [ADAMS-12].

**What it can and cannot express.** Everything is quantified resource flow plus state
signals; the diagram runs, so loops are observed, not only read off [ADAMS-12]. It has no
node for a rule as such: a rule appears only as the shape of connections and labels. Adams
notes the diagrams "can't reproduce the layout of the maze itself", so space and geometry
are out of scope [ADAMS-12].

## 2. Björk and Holopainen: gameplay design patterns and their relations

The 2003 paper introduces patterns as named, reusable descriptions of gameplay, and states
that each pattern's template ends with a "Relations" section [BLH-03]. That section has
"basically three forms of relationship": *superior* patterns, which "describe more abstract
characteristics" and "can be implemented by applying the given pattern"; *subpatterns*,
which "can be used to implement the given pattern"; and *conflicting* patterns "that are
difficult to implement with the given pattern" [BLH-03]. The paper reports "over 200" pattern
candidates and already complains that the super/sub relation alone is not enough, because
"some groups of patterns are normally used together to instantiate each other" [BLH-03].

The live wiki, maintained by the two authors, replaces the three forms with six named
sections on every pattern page: *Can Instantiate*, *Can Modulate*, *Can Be Instantiated By*,
*Can Be Modulated By*, *Possible Closure Effects*, and *Potentially Conflicting With*
[GDP-WIKI]. So the instantiate relation is directed and stored on both ends; the modulate
relation likewise; conflict is stored once. For example, *Cards* "Can Instantiate" Abstract
Player Constructs and Bookkeeping Tokens, "Can Modulate" Imperfect Information, and "Can Be
Modulated By" Cooldown, Discard Piles, and Hands [GDP-WIKI]. Each wiki page says it is an
"updated version" of the pattern from the 2005 book [GDP-WIKI]. I could not read the book's
own definitions of instantiate and modulate; see Gaps.

The collection now holds "over 600 patterns" and "over 600 games as references", and the
2020 visualiser project sorted its links into three layers: page hyperlinks, wiki categories,
and "the pattern layer, which is the relations between patterns" [LEE-20]. The same paper
built GDPVis, a node-link viewer over those relations, because the wiki "did not allow
searching the relationships" [LEE-20].

**What it can and cannot express.** This is the one tradition where the node is a named
gameplay idea rather than a resource or a rule, and the edges are typed relations between
ideas. The edges are unweighted, and "can" instantiate is possibility, not necessity. There
is no quantity and no simulation. The relation types are asserted by hand, one pattern page
at a time [GDP-WIKI].

## 3. Dan Cook: skill atoms and skill chains

Cook's unit is the *skill atom*, a loop in which "the player follows clues to the
acquisition of a new skill" [COOK-07]. It has four parts in sequence: *action* ("The player
performs an action"), *simulation* (the game updates), *feedback* (the game shows the
result), and *modeling* ("The player absorbs the feedback and updates their mental models")
[COOK-07]. Atoms link into a *skill chain*: the skill from one atom "feeds into the actions of
another atom" further down [COOK-07]. The chain is a directed graph whose edges
mean "this skill is a prerequisite for that one." Cook colours atoms by state: mastered,
partially mastered, unexercised, active, and burned out, the last for a skill the player
learned and then abandoned for lack of use [COOK-07].

**What it can and cannot express.** The graph is about the player's learning, not the
game's economy. Nodes are skills; edges are learning dependencies; there is one edge type;
it is hand-drawn. It cannot show resource quantities or feedback strength. It is the only
approach here with an explicit per-node lifecycle state [COOK-07].

## 4. MDA: why a mechanic graph is only the M layer

MDA splits a game into three linked lenses. *Mechanics* are "the particular components of
the game, at the level of data representation and algorithms" [MDA-04]. *Dynamics* are "the
run-time behavior of the mechanics acting on player inputs" and on each other over time
[MDA-04]. *Aesthetics* are "the desirable emotional responses evoked in the player" [MDA-04].
The layers are "separate, but causally linked": from the designer's side mechanics give rise
to dynamics which give rise to aesthetics; the player meets them in the opposite order
[MDA-04]. The paper lists eight aesthetics (sensation, fantasy, narrative, challenge,
fellowship, discovery, expression, submission) [MDA-04]. It also uses feedback systems as
its worked dynamic, with a thermostat and then Monopoly, where the leader "can penalize
players with increasing effectiveness" [MDA-04].

The point for a mechanic graph: nodes drawn as rules or components sit in M. Loops, tempo,
and runaway leaders are D and only exist when the mechanics run together [MDA-04]. The Smiths
adopted this framing directly, defining emergence as "A second order game Dynamic created by
the interaction of first order game Mechanics" [SMITH-04]. A static graph can name candidate
interactions; it cannot show which ones actually occur in play.

## 5. Koster, Cousins, Bura: atoms, ludemes, and Petri nets

**Koster (2005).** The slide deck is subtitled "game atoms: can games be diagrammed?"
[KOST-05]. The atom's ingredients are listed as: territory, preparation, core mechanic,
range of challenges, choice of abilities, skill required, variable feedback, dealing with the
mastery problem, and cost of failure [KOST-05]. Preparation is defined as "Prior choices
made that influence the next atom" [KOST-05]. The core mechanic slide is captioned "Or
'ludeme'", and Koster sides with Crawford's "verbs" as the nucleus of an atom [KOST-05].
Territory is "aka topology", defined as the operational space of a token: the vectors of
force it can apply and that can apply to it [KOST-05]. Games are "nested" atoms, and even
Checkers runs parallel atoms (remove all enemy pieces, remove one, set up a defence)
[KOST-05]. The notation slides draw Galaxian as boxes for goals, verbs, and tokens with
screen or time extents [KOST-05]. In 2012 Koster restated the atom as nine criteria and
said "Games can be viewed as directed graphs of game atoms", and that a molecule of atoms
must itself satisfy the criteria [KOST-12]. He credits Cousins: "I found Ben Cousins' work on
'ludemes' later, a term I gladly stole" [KOST-12]. The 2005 deck cites Cousins by name and
uses the phrases "ludemes" and "choice molecules" [KOST-05].

**Cousins (2004).** His Develop article is posted only as image scans, so I could not read
his definitions; see Gaps. The link from Koster above is the only primary attribution I
have [KOST-12].

**Bura (2006).** Bura wrote his grammar as "a reaction to Raph Koster's GDC 2005
presentation" and says it is "heavily influenced by my experience with Petri Nets and
cybernetics" [BURA-06]. The elements are: resource box, link, transition, resource tokens,
source, sink, inhibitor link, "if empty" link, variable link, and end state [BURA-06]. Links
are oriented and run only box to transition or transition to box, never box to box
[BURA-06]. A transition consumes tokens from every box linked into it and generates tokens in
every box linked out of it, fires only when each inbound cost is paid, and usually stands
for a player action [BURA-06]. A source generates tokens at a rate; a sink
consumes them; an inhibitor blocks a transition when a box holds enough; an "if empty" link
emits tokens while a box is empty; a variable link's amount changes by a function [BURA-06].
Bura maps Koster's "preparation" to "logical connections between atomic transitions and
prior choices" and draws a reusable "Decay of preparation" ludeme [BURA-06]. He notes the
diagrams "are not flowcharts" but "closer to data-flow representations", and that the
grammar needs "a library of ludemes with agreed upon inputs" to scale [BURA-06]. Koster's
post on the diagrams records a commenter seeing "a lot of similarities to Petri Nets", which
Bura's own text confirms [KOST-06] [BURA-06].

**What they can and cannot express.** Koster's atom is a checklist for one challenge and
a nesting rule; the linking notation was left as a sketch [KOST-05]. Bura's net is
executable in principle and is the closest ancestor of Machinations: boxes are pools,
transitions are converters, inhibitors are activators [BURA-06] [MACH-DOC]. Neither has a
node for a rule that changes another rule.

## 6. Harvey Smith and Randy Smith: orthogonal units and emergence

**OUD (2003).** "Orthogonal" is "A math term related to perpendicular axes", used
metaphorically for making elements "non-overlapping" [SMITH-03]. Units differentiated only
by degree (two cavalry troops with different speed) are not orthogonal; units with
"completely different features" are [SMITH-03]. The deck's phrases are: "Different Primary
Roles", "Spans the Design Space", "Orthogonal Axes Have Nothing In Common", and "each axis
represents, not necessarily the unit, but specific functionality" [SMITH-03]. The payoff
is stated as a "Second Order Consequence": orthogonal enemies force the player to change
tactics, where hit-point differences only make you shoot longer [SMITH-03].

**Emergence (2004).** Emergence is "A second order game Dynamic created by the interaction
of first order game Mechanics" [SMITH-04]. The deck's practical advice is to add
"indirect connections" between mechanics, to build a "Property system" so an object is
"a collection of properties", and a "Stimulus System" as a "Generalized channel for objects
to listen to each other" [SMITH-04]. The worked example is a guard that "Listens for Stim
types: Fire, Pierce", so a dropped candle igniting oil hurts him without anyone hard-coding
candle-to-guard [SMITH-04]. Hard-coding each pair is rejected because it "requires the
designer to explicitly think of every such interaction" [SMITH-04].

**On the "interaction matrix".** Neither deck contains the word matrix or grid (text search
of both files) [SMITH-03] [SMITH-04]. What they describe instead is a stimulus-and-property
scheme, which is a bipartite structure: objects emit stims and objects listen for stims, and
the object-by-object interactions are derived from that, not enumerated. The matrix idea may
live in another Looking Glass or Ion Storm source I did not find; see Gaps.

**What it can and cannot express.** Axes of function are a coordinate frame, not a graph.
The stim scheme gives typed edges (stim types) that are cheap to derive. It says nothing
about quantities or feedback.

## 7. Formal and computational: LUDOCORE, Ceptre, Ludii concepts

**LUDOCORE (2010).** A game is written in the discrete event calculus: *fluents*
("predicates whose truth values vary over time") and *events*, related by `happens(E,T)`,
`holds_at(F,T)`, `initiates(E,F,T)` and `terminates(E,F,T)` [LUDO-10]. The engine layers
game rules (state, events, consequences), a world configuration, a nature model, a player
model, and speculative assumptions on top of the event calculus [LUDO-10]. Answer-set
solving yields "gameplay traces" and supports "both temporal and structural queries"
[LUDO-10]. The graph here is implicit: initiates/terminates edges from events to fluents.
The authors present structural queries as "a novel feature for game engines" [LUDO-10].

**Ceptre (2015).** A program is terms, predicates, and unordered rules `S -o S'` in linear
logic, run by "replacement semantics": a rule consumes the resources on its left and
produces those on its right [CEPT-15]. Rules are grouped into *stages*, each "a unit of
computation that runs to quiescence", after which a `qui` rule hands control to another
stage [CEPT-15]. Execution records "a directed, acyclic graph between rule applications,
mapping onto their causal relationships" [CEPT-15]. Martens names as a use "Analyzing
feedback loops in game mechanics": unify all firings of each rule and "cycles in the
condensed graph may be analyzed" [CEPT-15]. This is the one source that derives a
rule-to-rule graph from execution rather than drawing it.

**Ludii concepts (2021).** A concept is "an abstract representation that can be shared
between different objects or ideas"; each has a name, a category, a data type (binary or
numerical), and a computation type [LUDII-21]. The taxonomy has seven categories:
Properties, Equipment, Rules, Math, Metrics, Visual, Implementation [LUDII-21]; the live
browser adds Behaviour and shows "809 concepts found" [LUDII-WEB]. Version 1.2.0 had 428
[LUDII-21]. A binary concept "is activated if a specific ludeme, or a combination of
ludemes, is used"; for example HOP CAPTURE needs a `(move Hop ...)` ludeme with a
`(remove ...)` inside it [LUDII-21]. Concepts are either *compilation concepts*, read off
the ludeme tree, or *playout concepts*, computed from many random playouts, such as game
length or the frequency of a move type [LUDII-21]. The concept taxonomy is a tree; the
mapping from ludemes to concepts is a many-to-many bipartite relation. Game-to-game
distance is a separate paper that computes distances "using their concept values" with
cosine similarity and Euclidean distance [LUDII-23]. Concept co-occurrence across games is
therefore a projection of the game-by-concept matrix, not a hand-drawn graph.

**What they can and cannot express.** LUDOCORE and Ceptre are executable and answer
questions by search, so loops are found, not asserted; the cost is writing the whole game
as logic [LUDO-10] [CEPT-15]. Ludii concepts are tags with values and no edge between
concepts except shared ludemes and shared games [LUDII-21].

## 8. Graph tooling and measures a small team could use

**Notation and drawing.**
- Graphviz DOT: `graph` with `--` for undirected, `digraph` with `->` for directed;
  attributes in `[k=v]`; `subgraph cluster_x` boxes a group; `strict` forbids multi-edges
  [DOT].
- Mermaid flowcharts: direction `TB`/`LR` etc.; links `-->`, `---`, `-.->`, `==>`; text on a
  link via `-->|text|`; `subgraph ... end`; `classDef` styles; no documented size limit
  [MERM].
- Obsidian graph view: notes are nodes, internal links are edges, node size grows with
  reference count; filters for tags, attachments, orphans; colour groups by search; a local
  graph with a depth slider; optional arrows for link direction [OBS].
- Neo4j Cypher: nodes `(n:Label {k:v})`, relationships `-[:TYPE]->`; "Relationships always
  have a direction"; direction is required on `CREATE` but may be omitted on `MATCH`;
  properties sit on nodes and relationships alike [NEO].

**Measures (NetworkX names, with the reference each page cites).**
- `degree_centrality`: degree divided by `n-1`; on a directed graph the docs use in and out
  degree separately [NX].
- `betweenness_centrality`: "the sum of the fraction of all-pairs shortest paths that pass
  through v"; cites Freeman 1977 and Brandes 2001 [NX].
- `strongly_connected_components`: Tarjan's algorithm; a non-trivial SCC in a directed graph
  is a set where every node reaches every other, which is the graph-theoretic form of a
  feedback loop [NX].
- `articulation_points`: "any node whose removal ... increases the number of connected
  components"; cites Hopcroft and Tarjan 1973 [NX].
- Bipartite: `B = (U, V, E)` with edges only across the two sets; `projected_graph`,
  `weighted_projected_graph`, `overlap_weighted_projected_graph`, and a generic weighted
  projection fold one side away [NX]. This is the operation behind Ludii's concept
  co-occurrence [LUDII-23] and the Smiths' stim scheme [SMITH-04].

**Deriving part of the graph from TypeScript.**
- dependency-cruiser reads JS and TS imports, builds the module graph, validates it against
  rules (circular, orphan, forbidden paths), and emits dot, mermaid, json, csv, and html
  [DEPC]. It sees files and imports, not functions or calls.
- ts-morph "wraps the TypeScript compiler API"; on any identifier `findReferences()` will
  "Find all the references of a node", and `getDefinitions()` jumps to its declaration; the
  navigation docs cover source files, compiler nodes, the language service, and the type
  checker [TSM]. That is enough to build a symbol-level call or reference graph.

## 9. Terminology: "topology"

In mathematics a topology on a set X is a collection of subsets, the open sets, that
contains X and the empty set and is closed under finite intersection and arbitrary union
[MW]; a topological space is the set together with that structure [EOM]. The field studies
"properties that are preserved through deformations, twistings, and stretchings" [MW]. A
graph with typed edges is not a topology in this sense; it is a graph, or a network. In
networking, "network topology" means "the physical and logical structure of a network", how
nodes "are placed and interconnected, as well as how data flows" [CISCO]. That informal
sense is what most people mean by "the topology of the mechanics". Koster used the word the
same loose way in 2005 ("Territory, aka topology") [KOST-05].

On real topological methods: I found one peer-reviewed use of persistent homology on games,
and it is spatial evolutionary game theory (Prisoner's Dilemma and SIRS on 2D lattices),
where the method detects "features that correspond to real aspects of the game dynamics"
[STEN-21]. I found no citation applying persistent homology or topological data analysis
to the state space or mechanic structure of a designed board or video game. A 2026 arXiv
preprint applies TDA to Steam genre data, which is market data, not mechanics; I did not
read it (see Gaps).

## Synthesis (agent-proposed)

| Approach | Node | Edge types | Typed / directed / weighted | Drawn or derived | Built to answer |
|---|---|---|---|---|---|
| Machinations [MACH-DOC] [DORM-09] | resource holder or transformer (pool, source, drain, converter, trader, gate, delay, register, end) | resource flow; label modifier; node modifier; trigger; activator | typed, directed, weighted (rates, multipliers, conditions) | drawn, then run | where the economy's feedback loops are and how strong |
| GDP patterns [BLH-03] [GDP-WIKI] | named gameplay idea | can instantiate; can modulate; possible closure; potentially conflicting (plus inverses) | typed, directed, unweighted | drawn by hand per pattern | which ideas imply, shape, or exclude which |
| Skill chains [COOK-07] | player skill | prerequisite | one type, directed, unweighted; nodes carry a lifecycle state | drawn | what the player must learn before what |
| MDA [MDA-04] | layer, not node | causal link between layers | three layers, directed both ways by viewpoint | conceptual | which questions a static rule list cannot answer |
| Koster atoms [KOST-05] [KOST-12] | challenge loop with nine ingredients | nesting; preparation (prior choice feeds next atom) | directed, unweighted | sketched | whether each challenge has every ingredient of fun |
| Bura net [BURA-06] | box (resource) and transition (action) | link with amount; inhibitor; if-empty; variable | typed, directed, weighted, bipartite (box to transition only) | drawn, executable in principle | how a game works below its printed rules |
| Smith stims [SMITH-04] | object with properties | emits stim; listens for stim (typed by stim) | typed, directed, unweighted, bipartite | derived from object properties | which interactions happen without hand-coding each pair |
| LUDOCORE [LUDO-10] | event and fluent | initiates; terminates | typed, directed | derived from logic rules | what traces and structures are possible |
| Ceptre [CEPT-15] | rule application (in traces); resource (in rules) | consumes; produces; causal precedence | directed; DAG per trace, cycles once condensed | derived from execution | which rules feed which, including loops |
| Ludii concepts [LUDII-21] | concept (tag with a value) | shares a ludeme; shares a game | bipartite, projectable to weighted co-occurrence | derived from ludeme trees and playouts | how alike two games are |

Four observations follow from the table, and none of them is a claim any one source makes.

First, only two traditions put a *mechanic* as the node with a *mechanic* at the other end
of the edge: the GDP patterns, whose edges are asserted by hand and unweighted, and Ceptre's
condensed trace, whose edges are counted from runs. Machinations, Bura, and LUDOCORE put
resources or state on one side of every edge; a rule-to-rule link is a two-hop path through
a pool or fluent.

Second, the edge vocabularies converge on four verbs under different names: *feeds*
(resource connection, produces, instantiates), *gates* (activator, inhibitor, initiates
and terminates, listens-for), *modifies* (label modifier, node modifier, modulates), and
*conflicts* (potentially conflicting, and nothing else; only the GDP collection has it).
Feedback appears as a cycle over those edges in Machinations, Bura, and Ceptre, and as a
named node type nowhere.

Third, the hand-drawn graphs (Machinations, GDP, Cook, Koster, Bura) are legible and
sparse; the derived graphs (Ceptre, LUDOCORE, Ludii, stims, dependency-cruiser) are complete
and noisy. No source combines both: a hand-typed edge set checked against a derived one.

Fourth, every source that claims to find loops does so by running the system or by cycle
detection on a directed graph, which is what strongly connected components compute. Weight
and speed of a loop (Dormans' seven characteristics) come only from a runnable model.

## Gaps

- Dormans' PhD thesis (`https://www.illc.uva.nl/Research/Publications/Dissertations/DS-2012-12.text.pdf`, and the HvA mirror): 18 MB, refused by the fetch tool. Not read.
- Adams and Dormans, *Game Mechanics: Advanced Game Design* (2012): book, not online. Not read. The seven loop characteristics are taken from the 2009 paper via a gist copy instead.
- The 2009 Dormans paper itself: no primary PDF located; read from `gist.github.com/kengonakajima/5073347`, which I cannot verify against the original.
- Björk and Holopainen, *Patterns in Game Design* (2005): book, not online. The book's definitions of "instantiates" and "modulates" were not read. A web-search snippet gave a definition; I did not use it.
- GDP wiki: HTTPS refused the connection; HTTP worked for `Main_Page`, `Cards`, `Resources`, `Category:Patterns`; `Dice` returned a 500. The `Underlying_Assumptions_and_Concepts` page does not define the relation terms.
- Koster's *A Grammar of Gameplay* book (2006): not read. Koster's 16 MB slide PDF was read by local text extraction; the diagram slides are pictures and only their labels came through.
- Cousins, *Elementary Game Design* (Develop, Oct 2004), at `https://benjaminjcousins.wordpress.com/2014/04/01/elementary-game-design/`: posted as four page images. Not readable by the fetch tool.
- Bura's original site returns 404; the Wayback copy was used.
- Both Smith decks were read as extracted text strings from `.ppt` files, so slide order and any picture-only content (including any matrix drawn as an image) are lost. No matrix or grid appears in the text.
- Ludii `concepts.php` shows only a nav bar; `searchConcepts.php` worked.
- "Games Mapper: Topological Data Analysis of Steam Genres" (arXiv 2606.14376) appeared in search results only. Not read.
- No textbook (Newman or similar) was fetched for the graph measures; the NetworkX pages and the papers they cite stand in.
