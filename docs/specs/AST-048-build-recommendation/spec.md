---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-048
authority: current
archive_reason: null
superseded_by: null
approved_by: josephfarina
approved_at: 2026-10-01
phase: accepted
owners: [josephfarina]
affects_architecture: [architecture:cli-surface]
affects_families: []
affects_contributing: []
affects_consumer_docs: [cli]
---

# Build recommendation system spec

## Intent

A builder, a person or a coding agent, describes the UI they want in words and
asks `astryx build` where to begin. A page template already carries the frame,
the spacing, and the section rhythm the system decided on; a page composed from
components has to rediscover all of that. So build's answer always starts from
a template: it names one page template to scaffold, the command that scaffolds
exactly that template, the next best templates, and the blocks and components
that fill it.

This record owns what build recommends and how the recommendation reads, in
text and JSON. `spec:AST-017` owns compatibility and response-field rules,
`spec:AST-042` owns command admission, search owns its own ranking and output,
and template owners own what each template is.

## Non-goals

- How candidates are ranked. Word matching, weights, thresholds, and the
  ranking algorithm are implementation; this record states what the
  recommendation must be and how a reader can act on it.
- Which templates exist, or how they look.
- Writing files. Build recommends; `astryx template` scaffolds.
- New commands, options, or flags. Build's options and exit codes are not
  changed by this record.
- Equivalent internal implementations remain valid when they satisfy this
  contract.

## Requirements

- **FR1 — Always one start.** A build that can return pages MUST name exactly
  one page template to start from, chosen among the ready page templates the
  project can scaffold, including the ones its integrations provide. A build
  narrowed to components or hooks names no start, and neither does a project
  that offers no page template.
- **FR2 — A shell when nothing leads.** When no template has the evidence to
  lead, the start MUST be the neutral app shell, or a blank page template when
  the project has no shell. The start never falls back to "compose from
  components".
- **FR3 — A part starts where it lives.** A request for a part of a page (a
  control, a state, a widget, a section) MUST start from the page template the
  request places that part in, when the request gives that page, and from the
  app shell (FR2) when it gives no page. The blocks and components in the kit
  carry the part itself. A request that changes a page the builder already has
  starts from the app shell (FR2): the page is the builder's to keep (FR9), and
  no template scaffolds it.
- **FR4 — Never an unready start.** A template marked not ready MUST NOT be the
  start or an alternative. When search matches one directly, the start's
  reason MUST name it and say the start is the closest ready template or the
  app shell instead.
- **FR5 — The start is exact and runnable.** The start and every alternative
  MUST carry the scaffold command that selects exactly that template in the
  project where build ran. A template an integration provides in place of a
  Core one is selected the way `astryx template` addresses it, and the command
  names the page kind so a block with the same id cannot make it ambiguous.
- **FR6 — The start says why.** The start MUST carry a basis and a one-line
  reason. The basis is `direct` when the start is also search's direct match,
  `closest` when no template is exactly this page, and `fallback` for the
  shell.
- **FR7 — The builder can overrule.** Beside every start, build MUST offer the
  next best page templates, at most two, each with its scaffold command.
- **FR8 — The kit fills the template.** Build MUST list the blocks that fill
  the start before the components, and name the always-on frame and
  foundation components.
- **FR9 — An existing page is kept.** Build's text output MUST tell a builder
  who is changing a page they already have to keep it and use only the blocks
  and components.
- **FR10 — The recommendation is data.** The JSON response MUST carry the
  recommendation itself (the start with its name, command, basis, reason, and
  alternatives), so no caller derives it from other fields.
- **FR11 — Additive JSON.** Changes to the recommendation MUST keep the build
  JSON additive under `spec:AST-017`: new data arrives as new fields, and
  every existing field keeps its shape and meaning. A ranking change may move
  values (which templates, blocks, or components appear, and in what order);
  it does not change a field's shape or meaning.
- **FR12 — Text leads with the start.** Build's text output MUST lead with the
  start, then the alternatives, then the blocks, then the components. Every
  response field keeps a text projection as `spec:AST-017` requires: short by
  default, and whole under `--verbose`.
- **FR13 — Every agent-facing surface agrees.** The build playbook, the
  generated agent docs, and the consumer guides that describe building a page
  MUST describe the same workflow: scaffold the named template, fill it with
  blocks, and compose only what is left. No surface tells builders to compose
  a page from primitives first.

### Platform support

- Supported floor: every shell and package manager the CLI already supports.
  Commands are printed with the project's run prefix in text and without it in
  JSON, as the CLI does for every command it prints.
- Unsupported behavior: none; build writes nothing, so there is nothing to
  degrade.
- Browser evidence: not applicable; the recommendation is CLI output.

## Current-state impact

Before this record, build named a template to scaffold only when one matched a
request almost by name. A looser match got a layout skeleton to use as a
reference, and a request with no page match was told to frame with an app
shell component and compose from primitives.

When this ships:

- the `build.kit` response gains the start, with its command, basis, reason,
  and alternatives; every existing field keeps its shape and meaning;
- build's text leads with the start and the alternatives, then the blocks and
  the components;
- the build playbook, the generated agent docs, and the consumer guides that
  describe building a page start from a template.

`architecture:cli-surface` keeps the command envelope and its rules unchanged.

## Verification

| Contract   | Verification                  | Representative states                                                                  | Mutation or failure expectation                                                                                       |
| ---------- | ----------------------------- | -------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| FR1, FR2   | Build kit tests               | a request that names a template; a loose request; a request no template fits           | A page build with no start, or a start that is not a page template                                                    |
| FR3        | Build kit tests               | a part placed in a page; a part with no page; a change to an existing page             | A part with no page starting from a page template, or a change to an existing page starting from that page's template |
| FR4        | Build kit tests               | search's direct match is not ready                                                     | An unready template as the start or an alternative, or a reason that hides it                                         |
| FR5        | Template integration tests    | an integration template that replaces a Core one; a block sharing a page template's id | A start or alternative command that selects another template, or none                                                 |
| FR6, FR7   | Build kit tests               | direct, closest, and fallback starts                                                   | A start without a basis or reason, or without its alternatives                                                        |
| FR8, FR12  | Text field tests              | default and `--verbose` text for a build with every field populated                    | A response field the text never shows, or text out of the required order                                              |
| FR9        | CLI text tests                | any page build                                                                         | Text without the keep-your-page line                                                                                  |
| FR10, FR11 | Response type and build tests | the canonical response type, the response docs, and existing fields on a page build    | A missing recommendation field, or an existing field whose shape changes                                              |
| FR13       | Playbook and agent docs tests | the playbook steps and the generated agent docs block                                  | A surface that tells builders to compose a page from primitives before a template                                     |

## Decision log

### DEC-1 — Start from a template, always

**Reference:** `spec:AST-048/DEC-1`
**Decider:** `josephfarina`, `2026-09-28`

Templates carry the spacing judgment and a kit of loose parts does not, so the
recommendation is always a full page template, and blocks and components fill
it.

Rejected: naming a template only on an exact match and a layout reference
otherwise, which leaves most builders composing from primitives.

### DEC-2 — A shell when nothing leads

**Reference:** `spec:AST-048/DEC-2`
**Decider:** `josephfarina`, `2026-09-28`

When no template has the evidence to lead, the start is a neutral app shell,
so even an unusual request starts from a frame the system decided.

Rejected: no start at all, which hands the builder primitives; and the best
weak match, which lets one incidental word pick the page.

### DEC-3 — The builder can overrule the pick

**Reference:** `spec:AST-048/DEC-3`
**Decider:** `josephfarina`, `2026-09-28`

The builder judges meaning better than word matching does, so every start
comes with the next best templates and their commands.

Rejected: a single pick with no alternatives.

### DEC-4 — A part starts where it lives

**Reference:** `spec:AST-048/DEC-4`
**Decider:** `josephfarina`, `2026-10-01`

A part is built inside a page. When the request gives that page, its template
is where the part goes; when it gives none, the app shell is the frame, and the
blocks and components carry the part. A change to an existing page is the same
case: the page is the builder's own, so no template is its start.

Rejected: starting a part from whichever page template shares a word with it,
which scaffolds an unrelated page for a single control; and giving a part no
start, which breaks DEC-1.

### DEC-5 — The response stays additive

**Reference:** `spec:AST-048/DEC-5`
**Decider:** `josephfarina`, `2026-09-29`

Callers read build's JSON, so the recommendation arrives as new data beside
the existing fields, and ranking changes move values rather than shapes. Text
may change with the recommendation.

Rejected: replacing existing fields with the recommendation, which breaks JSON
callers for a policy change they did not ask for.

## Open questions

- **OQ1 — How recommendation quality is measured.** Whether changes to what
  build recommends must report their effect on a checked-in set of
  representative requests with accepted templates, separately for requests
  that describe a whole page and requests that describe a part of one.
  (`human-design`)
