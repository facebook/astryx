# Writing knowledge records

Use this skill before creating or materially editing any component, module,
family, design, architecture, system, or theme knowledge record.

## Purpose and defining constraint

One record is one authoritative decision boundary, not a review dossier. Every claim
traces to authority; improve first-read clarity without changing meaning. Follow
[the templates and co-location rules](../../docs/README.md).

## Step 0 — Preflight metadata and shape

List every schema-required frontmatter key and checker/schema-required H2. Other
template headings are prompts; preserve all required shape. Resolve each value from
current authority. If unavailable, stop and report blocked;
never publish or guess. Use an empty array only after verifying no completed or
linked value exists. `verified_by` lists only completed, present evidence; future
requirements go in Verification. Requiring axe, Chromium, or AT does not prove they
ran.

## Step 1 — Build a source-fact ledger in scratch

Keep this ledger in uncommitted scratch space; never publish it.

| ID  | Classification                                              | Exact fact | Source link/path | Modality/cardinality/predicate         | Canonical owner | Destination    |
| --- | ----------------------------------------------------------- | ---------- | ---------------- | -------------------------------------- | --------------- | -------------- |
| F1  | `<supplied / derived-checkable / source-stated-unresolved>` | `<fact>`   | `<source>`       | `<may/must; one/many; if/when/unless>` | `<owner>`       | `<section/ID>` |

Include every frontmatter, authority, default, release, compatibility, ownership,
evidence, decider, behavior, variation, and open-decision fact. Absence is not a
fact; never turn it into a default, decision, owner, or rule. Classify each fact as:

- **Supplied fact:** stated directly by an authoritative input.
- **Derived checkable fact:** mechanically verifiable from its source or check.
- **Source-stated unresolved question:** explicitly left open by authority.

## Step 2 — Draft for a human first read

Open the intent/purpose with who is affected, their state, and the outcome or
defining guarantee. Follow with an **At a glance** table of exactly six rows. Each
gives an exact answer and exactly one H2/ID for user impact; public concepts and
explicit default status; critical state/interaction behavior;
compatibility/variation; canonical owners; and open decisions plus
required/completed evidence.

Preserve every predicate and signal word; never replace an exact answer with
“conditional.” “Repeated count changes are polite and deduplicated” does not mean
all count announcements. Use `not supplied` for default status only after verifying
no public default is supplied.

Use plain sentences and one stable term per concept. Component/module behavior uses
FR, accessibility uses AR, and decisions use DEC; design normative representations
use DR and decisions use DEC. Component Design relationships cite DR only from
linked design; theming stays descriptive or FR-linked unless linked design supplies
DR. Other kinds follow their template and source.

Co-locate critical behavior. Components put every interacting state needed for
review (busy/disabled/announcement and Escape predicates) in Behavioral and layout
contract; Accessibility cites those FRs and adds only accessibility semantics.
Design puts active presentation, predicates, fixed-open lifecycle, focus
entry/return, dismissal, viewport/safe-area, and fallback behavior in Responsive
and input behavior or one chosen H2; Design principles points to that DR. Use lists or tables for branches. Link shared owners and inspectable source/evidence;
delete optional placeholders, comments, and absence-only body sections.

## Step 3 — Run a closed-world fidelity audit

Map every frontmatter value, normative sentence/table cell, default, owner,
evidence status/scope, decision, and open question to the ledger. Preserve `if`,
`when`, `unless`, `only`, `may`, `must`, `never`, `always`, cardinality, defaults,
inheritance, and predicate order.

- “May use A or B, never both” does not mean “exactly one.”
- A positive predicate defines no negative branch. Record only source-stated
  branches; `compact AND coarse → sheet` does not imply `otherwise → popover`.
- “New” or “additive” does not mean “not released” or “default preserved.”
- Preserve the exact owner identifier. Add `component:`, `family:`, or
  `architecture:` only when current authority resolves that record kind.

Delete unsupported claims. Never infer authority, release/default state, decider,
ownership, review state, evidence scope, or formal open decisions. Use `not
supplied` only for required metadata or verified absence of a public default;
`unresolved` requires an authority-stated product or design question.

## Step 4 — Compress by removing duplication

Keep each meaning once, then cite its ID. Remove review history, implementation
narration, copied audit evidence, exhaustive tests, source caches, and repeated
rationale/rules. Keep domain names, signals, predicates, compatibility boundaries,
and cross-owner links. Roughly 100–150 lines guides an ordinary component/module;
it is not a gate. Keep one coherent matrix together when splitting harms clarity.

## Completion gate

Finish only when every required key/heading and ledger fact is present, every claim
maps to the ledger, and unsupported claims and contradictions are zero. Delete
non-required headings with no authoritative content.

Run the six-question retrieval audit. Each summary row must answer directly,
preserve predicates/signals, and route to exactly one H2/ID; the reader uses the
opening plus at most that section.

## Validation

1. Run `pnpm check:knowledge`.
2. Open every changed link and confirm its source or evidence.
3. Review the diff for duplicated meaning, missing signals, and invented claims.
4. When possible, ask an independent reviewer to compare the record with the
   scratch ledger for fidelity.
