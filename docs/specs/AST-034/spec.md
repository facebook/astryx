---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-034
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-09-11
phase: accepted
owners: [cixzhang]
affects_architecture:
  [
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
    architecture:cli-surface,
  ]
affects_families: []
affects_contributing: [contributing:cli-conventions]
affects_consumer_docs: [theme]
---

# Theme family artifact graph system spec

## Intent

A consumer application should be able to load one complete theme family without
knowing the family's inheritance graph or ordering its files. The caller supplies one
stable `artifactKey`; the required family output is one native
`<artifactKey>.css` containing every selected member, one standard ESM
`<artifactKey>.js` exporting every complete member, one matching
`<artifactKey>.d.ts`, and one `<artifactKey>.manifest.json` plus its receipt set.
Selecting or switching a loaded member requires only its theme identity.

CSS, JavaScript, and types have separate consumption contracts:

- native CSS is loaded with
  `<link rel="stylesheet" href="<artifactKey>.css">`, contains shared declarations
  once plus scoped member deltas, and owns visual readiness and cascade behavior;
- standard ESM imports `<artifactKey>.js`, whose named exports are complete resolved
  theme objects and which does not make CSS ready; and
- `<artifactKey>.d.ts` describes those exports at compile time and has no runtime
  loading or readiness behavior.

`artifactKey` controls only this coordinated set's public filename stem. It does not
change family-member identity, theme inheritance, local-token ownership, or CSS
custom-property names. The literal key `family` and paths in examples are
illustrative; the required suffixes and one-family-set roles are normative. A bundler
CSS import is an adapter over the same `<artifactKey>.css`, not the baseline that
defines correctness.

This contract replaces the delta-stylesheet assumptions in public
[PR #5687](https://github.com/facebook/astryx/pull/5687). That proposal established
useful family-compilation and zero-specificity techniques, but its documented child
CSS was not a failure-atomic consumption unit, zero-delta members could leave stale
output while `--check` passed, and composed registry bindings could generate invalid
JavaScript. Its useful cascade technique remains: shared family declarations use
`:where(:scope)` or an equally zero-specificity construct, while member deltas use
`:scope`, so member values win without specificity escalation even if unrelated
stylesheets in the same layer are reversed. This controls winners after rules exist;
it does not load a missing dependency, remove an `@import` waterfall, define link
readiness, or make partial CSS application atomic.

A completed Chromium, Vite, and TypeScript probe passed 195 assertions with no
failures. With the illustrative `artifactKey` `family`, native `family.css` made one
request, rendered every member correctly on
first paint, supported attribute-only switching with no wrong sampled frames, and
survived folder relocation. Native per-member relative-import wrappers worked when
complete, but a missing parent fired the top-level link's `error` while the child
delta still applied. Therefore this specification does not define or ship them. Any
future lazy per-member packaging needs a separate specification; a bare wrapper
cannot be a correctness boundary.

The same change removes a naming restriction unrelated to artifact safety. A theme
owner may declare a theme-local token with any valid CSS custom-property name. Exact
ownership, lineage, reference, collision, and cycle validation remain mandatory; a
prefix is neither ownership metadata nor an enrollment API.

## Non-goals

- Implement the compiler, runtime, validator, CLI, or generated artifacts in this
  specification pull request.
- Introduce a family CLI command, response field, error code, package export map, or
  output-directory contract beyond the approved `--family` selection shape and this
  specification's required `--family-key <key>` input.
- Add or change the portable/global token vocabulary.
- Define component APIs, component design, visual values, or theme-specific token
  meanings.
- Add a native renderer or make CSS artifact structure part of shared authoring.
- Add another local-token namespace field, alias API, or authoring operation.
- Make a bundler's CSS graph, chunking, side-effect retention, or import order the
  normative family contract.
- Define or ship per-member family CSS, JavaScript, or type entrypoints. Any future
  lazy per-member packaging requires a separate specification and cannot treat a bare
  relative-import CSS wrapper as failure-atomic.
- Require a family build for standalone themes or for consumers that prefer one
  complete standalone theme.

## Requirements

### Family identity and graph

- **FR1 — Exact extension lineage defines the family graph.** A family build MUST
  derive a directed acyclic graph from the selected themes' exact normalized
  `extends` lineage. Each member has one stable theme name and at most one parent.
  A selected family has exactly one root, and every other member reaches that root
  through selected parent edges. The build MUST reject duplicate names, duplicate
  identities, cycles, missing selected ancestors, a parent edge that disagrees with
  normalized lineage, and a member whose source cannot be associated with exactly
  one graph node. Indirect descendants are valid; a family is not limited to one
  base and its direct children.
- **FR2 — One keyed native family set is the required public boundary.** A successful
  family build MUST expose exactly one `<artifactKey>.css`, one
  `<artifactKey>.js`, one `<artifactKey>.d.ts`, and one
  `<artifactKey>.manifest.json` plus its receipt set for the complete selected graph.
  The CSS MUST provide every member's complete CSS behavior. The ESM MUST expose one
  complete resolved object per member and MUST NOT import CSS or fan out to
  per-member generated modules. The declaration file MUST describe every public ESM
  member export in that one module. A consumer MUST NOT discover the graph, import an
  ancestor, order private sections, or evaluate the manifest to assemble a member.

  The narrow stable CLI spelling is:

  ```sh
  astryx theme build --family <base> <children...> --family-key <key>
  ```

  `--family-key <key>` is required exactly when `--family` is present and is refused
  otherwise, before any output write. It accepts an exact ASCII lower-kebab key
  matching `[a-z0-9]+(?:-[a-z0-9]+)*`; the CLI does not normalize it. The key MUST be
  collision-checked against every path the invocation would own and against existing
  unowned output. Check mode takes the same key and compares the same owned set.
  The approved family composition matrix is: family mode is refused with `--watch`
  and `--out`, and composes with `--check` and `--icons-specifier`. This adds no
  response field or error code.

  **Non-normative native example.** With `artifactKey: 'family'`:

  ```html
  <link rel="stylesheet" href="./generated/current/family.css" />
  <script type="module">
    import {oceanDeepTheme} from './generated/current/family.js';
  </script>
  ```

  A bundler adapter imports those same files:

  ```ts
  import './generated/current/family.css';
  import {oceanDeepTheme} from './generated/current/family.js';
  ```

  The bundler MUST consume the same CSS and ESM files. Bundler flattening, chunking,
  and tree-shaking are adapter behavior, not proof of the native contract; the keyed
  ESM remains CSS-free.

- **FR3 — Identity and order are deterministic.** The exact caller-supplied
  `artifactKey`, graph identity, section identity, manifest order, generated binding
  names, output paths, and provenance MUST determine the coordinated output set.
  Graph and content order derive from normalized theme names, exact parent edges,
  canonical section kinds, normalized source identity, and content—not invocation
  order, object traversal accidents, locale, file timestamps, temporary paths, or
  process identifiers. `artifactKey` is only the stable output stem; changing it MUST
  NOT change theme identity, graph membership, local-token ownership, CSS
  custom-property names, member exports, or compiled values. Canonical graph order repeatedly emits the lexicographically least eligible node
  whose parent has already been emitted, using theme name and then normalized source
  identity as the comparison key; eligibility is recomputed after every emitted
  node. Section kinds use the fixed order in FR5. With the same sources, options,
  and tool versions, shuffled input arguments MUST produce byte-identical committed
  output.
- **FR4 — A zero-delta member still exists.** A member whose complete logical plan is
  byte-identical to its parent still receives its own stable identity, scoped CSS
  applicability, ESM export, declaration, manifest membership, receipt evidence, and
  cleanup/check coverage inside the one keyed family set. Family generation MUST NOT
  emit a distinct per-member file or private payload. The build MUST NOT return
  “nothing to build” in a way that skips, preserves, or hides that member's owned
  output state.

### Complete authoritative compilation

- **FR5 — One compilation plan accounts for every section.** Runtime mounting,
  standalone build, and family build MUST obtain CSS behavior from the same web
  compiler. Before packaging or factoring, family compilation MUST create one
  canonical complete plan per member, with an explicit disposition for every
  current section in this order:
  1. theme-independent data defaults and layer ordering;
  2. prose defaults;
  3. portable tokens and theme-local tokens;
  4. component rules, including derived-variable lowering and generated prop-value
     rules; state names and state semantics remain component-owned and are never
     theme-generated;
  5. ordered adaptations, their effective width points, generative axes, and
     inherited rule order;
  6. `onDark` and `onLight` token and component rules after adaptations;
  7. root and surface `color-scheme` behavior;
  8. syntax values and other domain-token values;
  9. icon and indicator registry values and source-preserving bindings;
  10. font requirements and notices discovered from every effective section;
  11. JavaScript data required for use and source-equivalent extension;
  12. the family ESM exports, family declaration, and every required module
      augmentation; and
  13. deterministic provenance, manifests, and build/check receipts.

  Each section MUST identify whether it contributes to CSS, JavaScript, types,
  authoring receipts, or more than one track. Dependency behavior in one track MUST
  NOT be inferred for another. A section may be empty, but it MUST be represented
  deliberately. Adding a new normalized theme surface requires adding it to this
  plan before standalone and family packaging may support it.

- **FR6 — Factoring follows complete plans, not ad hoc deltas.** The compiler MUST
  first prove each member's complete logical plan. Packaging MAY then emit a shared
  CSS declaration block once when all named members require byte-identical semantics,
  scope boundaries, order, and values; member-specific differences remain scoped
  member deltas in the same family stylesheet. JavaScript and type generation MAY
  deduplicate internal values while retaining complete family exports and matching
  declarations. Factoring MUST NOT reconstruct completeness by subtracting one
  resolved object from another opportunistically, comparing serialized objects
  without section semantics, or assuming that a base file loads separately. A
  mutation that removes any FR5 section MUST make parity or completeness
  verification fail.
- **FR7 — JavaScript and type bindings are collision-safe.** The family ESM and
  declaration file MUST allocate legal local bindings from the complete graph, not
  copy source-local names into one lexical scope. Allocation MUST be deterministic,
  deduplicate the same imported binding when safe, and disambiguate different
  specifiers or exports that used the same source-local name. Icons, indicators,
  inline values, partial registry maps, inherited values, and type augmentations
  receive the same treatment. The family ESM MUST parse, import, and export the
  exact registry values selected by every member; the family declaration MUST
  type-check those exports and augmentations.
- **FR8 — Family ESM members preserve source-equivalent extension data.** Every
  exported member object MUST retain the complete normalized tokens, local-token
  owner and lineage metadata, components, media surfaces, adaptations, effective
  axes, icons, indicators, and other data required for a child to extend that member
  as it would the source member. CSS text remains in the independent stylesheet.
  Factoring MUST NOT turn an exported member into a partial base or make ESM import
  responsible for stylesheet readiness.

### Native artifacts, manifests, and the cascade

- **FR9 — The manifest owns generation, not runtime assembly.** Each family
  generation MUST have one deterministic `<artifactKey>.manifest.json` that records
  its schema version, the exact `artifactKey`, family and member identities, exact
  parent edges, the public `<artifactKey>.css`/`.js`/`.d.ts` paths, ordered section
  identities, owned paths and content digests, source-graph digest, and compiler/tool
  versions. The manifest lives inside its immutable,
  content-identified generation directory and is the ownership boundary for cleanup
  and `--check`; it MUST NOT claim a user-authored or unrelated file. Consumers MUST
  NOT evaluate the manifest to discover imports, order sections, select members, or
  decide runtime readiness. One stable `current` filesystem indirection (or an
  equivalent atomic directory-pointer primitive) selects the active generation.
- **FR10 — `<artifactKey>.css` contains the complete family cascade.** The required
  native stylesheet MUST contain reset, base, and theme layer order plus all shared
  and member-specific sections needed by the selected graph. Shared declarations appear
  once and apply to the exact members that inherit them. Shared family declaration
  selectors MUST use `:where(:scope)` or an equally zero-specificity construct;
  equivalent shared component selectors MUST also have zero specificity. Member
  deltas MUST use `:scope` and the existing `to ([data-astryx-theme])` boundary.
  This preserves parent/child winner selection without specificity escalation even
  when an unrelated stylesheet in the same layer is physically reversed. It does
  not solve missing files, request waterfalls, link readiness, or partial-failure
  atomicity. Portable and local declarations, component rules, ordered adaptations,
  and media-surface rules MUST keep the same winner as standalone and runtime
  compilation. Nested and sibling roots MUST remain isolated. After
  `<artifactKey>.css` loads, switching a member MUST require only changing theme
  identity and MUST NOT add, remove, or reorder stylesheet links.
- **FR11 — CSS, JavaScript, and types have independent native contracts.**
  `<artifactKey>.css` MUST be a standard standalone stylesheet usable by an HTML
  `<link>`. `<artifactKey>.js` MUST be the one standard ESM module for the family,
  with static, valid, cycle-safe external imports and complete named member exports;
  the initial contract emits no per-theme JavaScript modules and no second aggregate
  module. A missing module dependency MUST reject the module graph rather than expose
  a partial member. `<artifactKey>.d.ts` MUST be the one declaration file for that ESM
  surface under supported TypeScript module resolution; the initial contract emits no
  per-theme declarations. Types MUST NOT define runtime readiness. JavaScript MUST NOT
  import CSS in the required native output, and CSS load does not imply ESM or type
  availability. After a public artifact is read through `current`, any retained
  external import MUST be static and stable; no public artifact may require a source
  theme, manifest evaluation, or filesystem convention at consumer runtime.
- **FR12 — Receipts stay outside runtime artifacts.** Build/check receipts, source
  paths used only for diagnostics, and comparison evidence MUST NOT be bundled into
  runtime CSS, ESM exports, or consumer declarations. Stable generated provenance
  may identify source, command, and tool versions without making a machine-specific
  absolute path or timestamp part of output identity. The manifest and receipts MAY
  share one generated metadata set, but only the manifest owns published paths and
  cleanup.

### Atomic writes, cleanup, and check mode

- **FR13 — The family publishes one immutable generation atomically.** The build
  MUST compute every member plan in memory, then write exactly
  `<artifactKey>.css`, `<artifactKey>.js`, `<artifactKey>.d.ts`,
  `<artifactKey>.manifest.json`, and receipts into a new content-identified
  generation directory. It MUST NOT write a per-member artifact or private payload.
  Before changing the active family, under one family-output lock, it validates and
  durably flushes that directory, writes and flushes a transaction journal containing
  the prior and next generation identities, then atomically replaces the single stable
  `current` indirection. It MUST durably flush the new indirection and its parent directory
  before any superseded generation is eligible for removal. Active family files are
  never rewritten one by one. A platform without an equivalent atomic, durably
  flushable directory-pointer primitive MUST refuse family output rather than weaken
  this guarantee. This is offline artifact generation: consumers MUST begin reading
  CSS, JavaScript, and types only after the family build releases the lock. Live
  hot-swapping or concurrent reads during a family build are unsupported.
- **FR14 — Recovery and cleanup are manifest-bounded.** On every build or `--check`,
  the tool acquires the family lock and resolves any existing journal before normal
  work. If `current` names the journal's next generation, it completes post-commit
  cleanup; otherwise it restores the prior pointer and removes the uncommitted next
  generation. The journal records every new generation path and both manifest
  digests. It is removed and that removal is durably flushed only after commit
  recovery or rollback completes. A superseded generation becomes eligible for
  cleanup only after the new pointer and parent-directory flush in FR13; the tool
  may remove it only when its own manifest proves family ownership. It MUST never
  infer ownership from a broad filename glob or remove an unmanifested file. A crash
  at any instruction boundary therefore recovers to one complete generation before
  another build or check proceeds.
- **FR15 — `--check` compares the complete owned family set.** After the mandatory
  FR14 preflight recovery—which is the only write check mode may perform—check mode
  builds the expected family graph, complete member plans, keyed CSS/ESM/declaration,
  keyed manifest, and receipts in memory without writing generated output. It fails
  for a missing or outdated expected file, an `artifactKey` mismatch or path
  collision, an extra file owned by the prior manifest, stale section or member
  order, stale digests or provenance, a removed or renamed member, a missing
  zero-delta identity/export/declaration/receipt, an ESM/type mismatch, or CSS that
  omits or duplicates an owned shared/member section. Existing
  build/check response contracts remain the response boundary unless a separately
  accepted change introduces a stable field or error code.

### Theme-local names

- **FR16 — Ownership is explicit metadata, not a prefix.** Supplying `localTokens`,
  or extending an exact enrolled base, continues to create the flattened declaration
  map plus exact owner and lineage metadata. A newly declared key MUST be a valid CSS
  custom-property name and MUST NOT collide with a portable `tokens` key. The
  validator MUST NOT require, reserve, rewrite, or infer ownership from any prefix.
  External theme owners may therefore use names such as `--ac-selection-ink` without
  a new namespace API. Astryx-maintained themes MAY use `--astryx-*` as their own
  internal naming convention; that convention places no restriction on external
  themes and has no effect on enrollment or ownership.
- **FR17 — Declared local references remain closed.** Enrolled themes still preserve
  each complete declaration name byte-for-byte through normalized data, inheritance,
  runtime CSS, built CSS, generated types, and metadata. The validator scans
  local-token values, root component overrides (including nested pseudos),
  `onDark.components`, `onLight.components`, and adaptation
  `value.localTokens`/`value.tokens`/`value.components`. On those surfaces, a `var()`
  reference that exactly matches a declaration in the effective enrolled lineage is
  an owned local edge and participates in exact owner, lineage, collision, and cycle
  validation. Under this contract, every non-exact reference—including a case-only
  difference—remains an external custom-property dependency; no prefix turns it into
  an undeclared local name. An adaptation `value.tokens` key that exactly matches an
  effective enrolled local declaration MUST be rejected with guidance to write that
  key through `value.localTokens`, where owner, lineage, and cycle validation apply.
  Root `tokens`, `onDark.tokens`, and `onLight.tokens` maps remain portable-token
  surfaces and their references are not reclassified. A child may replace an
  inherited declaration only through its exact enrolled lineage, and a new
  declaration records the child as owner. Prefix similarity grants no ownership.

### Compatibility and migration

- **FR18 — Existing names and standalone builds remain compatible.** Existing long
  theme-local names remain valid with the same bytes, meanings, owners, references,
  and lineage. Relaxing the prefix rule broadens accepted enrolled input; it does not
  rename or reinterpret existing declarations and does not change unenrolled legacy
  behavior. A standalone theme build continues to emit a complete standalone unit
  and requires no family manifest.
- **FR19 — Family optimization is opt-in at one keyed artifact-set boundary.** A theme
  package adopts family output by publishing the complete native
  `<artifactKey>.css`, `<artifactKey>.js`, `<artifactKey>.d.ts`,
  `<artifactKey>.manifest.json`, and receipts together. Consumers load the keyed CSS
  and independently import the keyed ESM; they do not add manual ancestor imports or
  per-member file ordering. Loading `<artifactKey>.css` downloads every selected
  member's delta, an explicit tradeoff for one request, complete first paint, and
  attribute-only switching. Consumers that need only one theme may keep a complete
  standalone build. The artifact key changes filenames only, not theme semantics.
  This contract defines no per-member family output. Any future lazy per-member
  packaging requires a separate specification.
- **FR20 — PR #5687 is evidence, not the implementation.** This specification keeps
  that pull request's complete-plan goals and zero-specificity shared-declaration
  technique but supersedes its required base-plus-delta consumption model. Its
  command experiments and tests may inform a replacement, but only the approved
  `--family … --family-key <key>` shape in FR2 is stable. Implementation, release
  notes, and any required consumer migration belong in a separate replacement pull
  request.

### Platform support

- Supported feature/engine floor: the same browser, CSS custom-property, cascade
  layer, and `@scope` support as the existing web theme compiler.
- Unsupported behavior: a consumer path that cannot load the native family CSS or
  standard ESM MUST use a compatible adapter or complete standalone output. It MUST
  NOT load a private delta as a complete member. Family output is not a watch or
  live-reload channel, and concurrent reads while its output lock is held are outside
  the supported contract.
- Browser evidence: real Chromium MUST verify the raw native link, first paint, all
  selected members, representative component states, adaptations, media surfaces,
  nested and sibling roots, attribute-only switching, reversed unrelated stylesheet
  order in the same layer, and folder relocation. The retained per-member-wrapper
  missing-parent negative MUST prove why that output is excluded. A bundler adapter
  MUST be verified using the same native CSS and ESM files. Structural tests remain
  required for ESM, declarations, manifests, cleanup, and transactional failures.

## Current-state impact

Current `main` compiles each theme as one complete standalone CSS, JavaScript, and
TypeScript unit. It already uses Core's shared web generators, preserves normalized
adaptation and local-token metadata in built themes, stages a single theme's output
before rename, and compares expected files in check mode.

Implementing this accepted contract will extend those guarantees to one keyed family
generation. It will add complete per-member compilation plans; one native
`<artifactKey>.css`, one CSS-free `<artifactKey>.js`, one `<artifactKey>.d.ts`, and
one `<artifactKey>.manifest.json` plus receipts; graph-wide collision-safe binding
allocation; manifest-bounded cleanup; and one transactional family commit. It will
also relax the enrolled local-token validator from an exact theme-name prefix to any
valid CSS custom-property name while retaining all non-prefix validation.

This accepted specification changes no runtime, compiler, CLI, generated artifact,
package, or token vocabulary by itself. It adds no Changeset. It affects
`architecture:cli-surface` because implementation MUST make
`--family-key <key>` a stable required value flag for the approved
`theme build --family <base> <children...>` shape. It adds no response field or error
code. The literal key `family` remains illustrative; callers choose the stable output
stem under FR2. The worked family example in `docs/contributing/cli-conventions.md`
must be updated with the required key, exact four-file output set, and final
composition matrix in the implementation change.

## Verification

| Contract  | Verification                                                                           | Representative states                                                                                                                                                        | Mutation or failure expectation                                                                                                                                                         |
| --------- | -------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FR1–FR4   | graph, keyed-family-artifact, CLI-composition, and zero-delta fixtures                 | valid/invalid/colliding key; family-key without family; family without key; direct/indirect descendants; shuffled inputs; zero-delta child                                   | an invalid graph/key builds, key spelling changes theme identity or values, input order changes bytes, one keyed artifact is absent, or a zero-delta identity disappears                |
| FR5–FR8   | complete-plan inventory plus runtime/standalone/family structural parity               | every CSS/JS/type/receipt section; component-owned states; adaptations; media surfaces; reused bindings; complete ESM exports; matching declarations                         | deleting a section leaves parity green, a state becomes theme-generated, CSS/JS/type dependency behavior is conflated, an exported member loses extension data, or bindings collide     |
| FR9–FR12  | manifest schema, native artifact structure, provenance, and real-browser cascade tests | raw `<link>`; first paint; standard ESM import; `tsc`; all members; nested/sibling roots; states/adaptations/media surfaces; reversed stylesheet order; relocation           | runtime must evaluate a manifest, shared declarations duplicate, a member delta loses to shared rules, CSS import is hidden in required ESM, or types imply runtime readiness           |
| FR13–FR15 | crash injection and complete-owned-set check fixtures                                  | first build; rebuild; pre/post-pointer crash; journal recovery in check; removed/renamed/zero-delta member; missing/outdated/extra owned file                                | a crash exposes or recovers mixed generations, cleanup removes an unowned/unflushed predecessor, or check passes stale/incomplete CSS, ESM, declarations, manifest, or receipts         |
| FR16–FR18 | shared runtime/static local-token validator matrix                                     | existing long name; `--ac-selection-ink`; case-distinct external name; invalid custom property; portable collision; foreign owner; exact references; direct/adaptation cycle | prefix or non-exact spelling changes external validity, an exact local edge escapes ownership, an existing name changes bytes, or collision/cycle checks weaken                         |
| FR19–FR20 | native/bundler matrix, rejected-wrapper negative, and replacement-PR review            | one-request family load; first paint; attribute switch; Vite adapter over same files; missing wrapper parent; standalone consumer                                            | family CSS does not include every member, switching requests CSS, per-member output enters this scope, a bundler-only behavior becomes normative, or PR #5687's delta model lands as-is |

The completed feasibility probe is retained as evidence, not implementation: Chromium,
Vite, and `tsc` passed 195 assertions with zero failures; the family stylesheet used
one request; all sampled first-paint and switching frames were correct; relative
folder relocation worked; and a missing wrapper parent demonstrated partial CSS
application despite top-level `link.onerror`. Its hand-built fixtures do not satisfy
the implementation gates for transactions, manifest/receipt ownership, zero-delta
cleanup, deterministic generation, prefix-independent validation, component states,
adaptations, or media surfaces.

### Completion criteria

This specification is `accepted`. It moves to `shipped` only when:

- every selected member is represented in one native `<artifactKey>.css`, one
  standard CSS-free `<artifactKey>.js`, one `<artifactKey>.d.ts`, and one
  `<artifactKey>.manifest.json` plus receipts, including zero-delta members;
- `--family-key <key>` is required exactly for family mode, rejects invalid or
  colliding keys before writes, and changes only the coordinated output stem;
- runtime, standalone, and family compilation use one canonical web compilation plan
  and pass complete-section parity independently for CSS, JavaScript, and types;
- shared CSS declarations emit once at zero specificity, member deltas use `:scope`,
  and nested/sibling members preserve winners without stylesheet-order escalation;
- manifests encode deterministic graph and section order, own exact cleanup, and
  require no consumer runtime assembly;
- graph-wide generated bindings parse, type-check, import, and preserve registry
  values under source-name collisions;
- immutable-generation staging, pointer/directory durability, journal recovery,
  cleanup, and check pass crashes at every instruction boundary plus missing, stale,
  extra, removal, and rename states;
- real Chromium proves raw-link first paint, every member, representative component
  states, adaptations, media surfaces, nested/sibling roots, attribute-only switching,
  reversed unrelated stylesheet order, relocation, and the rejected per-member
  wrapper's missing-parent failure; a bundler adapter proves it consumes the same CSS
  and ESM files;
- no per-member family artifact is emitted or documented by this implementation; and
- valid external custom-property names enroll without prefix policy while exact
  ownership, lineage, reference, collision, and cycle checks remain.

## Decision log

### DEC-1 — Make one native family set the required boundary

**Reference:** `spec:AST-034/DEC-1`
**Decider:** `cixzhang`, `2026-09-11`

A consumer loads one keyed family stylesheet and independently imports one keyed
family ESM. The stylesheet contains shared declarations once plus every scoped member
delta; the ESM is the only generated family module and exports every complete member;
the one declaration matches those exports. Switching a loaded family is an attribute
change. This eliminates consumer graph and import-order management while keeping CSS,
JavaScript, and type readiness separate.

The caller supplies the stable output stem through
`astryx theme build --family <base> <children...> --family-key <key>`. A required
value flag is the narrowest addition because it changes only what the approved family
build job names; it does not create a second command or overload theme identity. The
exact lower-kebab key deterministically names `<key>.css`, `<key>.js`,
`<key>.d.ts`, and `<key>.manifest.json` and is collision-checked before writes. There
is no derived default: deriving the stem from a member would conflate artifact naming
with theme identity and could collide when the selected family changes.

Rejected: requiring separate public entrypoints for every member or documenting a
child delta plus manual base import. A family stylesheet eagerly downloads all member
deltas, but buys one request, complete first paint, and attribute-only switching. A
complete standalone theme remains valid for the one-theme case.

Per-member relative-import wrappers are excluded from this specification. The Chromium
probe showed why a bare wrapper cannot be the baseline: a missing parent raised
`link.onerror` while the child delta still applied. Any future lazy per-member
packaging requires a separate specification.

### DEC-2 — Compile complete plans before family factoring

**Reference:** `spec:AST-034/DEC-2`
**Decider:** `cixzhang`, `2026-09-11`

One complete logical plan per member is the proof that family output preserved
behavior. Sharing happens only after the plan accounts for every current compiler,
registry, type, diagnostic, and provenance section. Shared CSS uses
`:where(:scope)` or equivalent zero specificity; member deltas use `:scope`. This
preserves member winners even when unrelated same-layer stylesheet order reverses,
without raising specificity. It does not provide loading, readiness, or failure
atomicity.

Rejected: subtracting resolved objects or serialized CSS and assuming omitted values
will arrive from a separately loaded base.

### DEC-3 — Let the manifest own one transactional generation

**Reference:** `spec:AST-034/DEC-3`
**Decider:** `cixzhang`, `2026-09-11`

A manifest gives generation and check mode an exact, reviewable ownership set for
`<artifactKey>.css`, `<artifactKey>.js`, `<artifactKey>.d.ts`,
`<artifactKey>.manifest.json`, receipts, publication, and cleanup. It does not
instruct consumers how to assemble runtime output. The build durably stages an immutable generation and journal, then atomically replaces and
flushes one `current` filesystem indirection. On restart the tool resolves any
interrupted journal before another build or check proceeds.

Rejected: per-member writes followed by broad filename cleanup or runtime manifest
assembly. A late failure can publish a broken family, and a glob cannot distinguish
generated files from a consumer's files safely.

### DEC-4 — Keep local-token ownership independent of spelling

**Reference:** `spec:AST-034/DEC-4`
**Decider:** `cixzhang`, `2026-09-11`

A valid CSS custom-property name, exact owner metadata, and exact enrolled lineage are
sufficient to own a theme-local token. Existing Astryx-prefixed names remain valid,
but prefix spelling is only an owner convention. This supersedes all of AST-006
decision 2 and only decision 4's clauses that classify or validate references through
that reserved prefix. AST-006's explicit enrollment boundary, shared runtime/static
validator, exact lineage, cycle checks, collision checks, and legacy unenrolled
behavior remain in force.

Rejected: reserving `--astryx-*` for external themes, requiring a theme-name prefix,
or adding a namespace API. Those rules constrain names without strengthening the
owner, reference, collision, or cycle proof.

## Open questions

None.
