---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-066
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-01
phase: accepted
owners: [cixzhang]
affects_architecture:
  [
    architecture:theme-compilation,
    architecture:theme-application,
    architecture:theme-tokens,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme]
---

# StyleX data-token ownership system spec

## Intent

Astryx owns one canonical 56-token data palette in the same public StyleX token
system as its other design tokens. Components import the public StyleX variable
object instead of constructing literal `var(--color-data-*)` strings. The
StyleX compiler emits the canonical group when a compiled consumer uses it and
omits the group from builds that do not use it.

A concrete theme emits only data-token values that the theme explicitly authors,
inside its existing theme donut. It never carries the canonical defaults or a
raw global data-token block. Unspecified data colors use the StyleX defaults and
normal CSS inheritance; a nested theme changes only the subset it authors.

The public CSS custom-property names, JavaScript token resolution, generated
JavaScript marker, and three existing global `color-scheme` rules remain stable.
Runtime and built theme compilation produce the same sparse scoped override.

StyleX 0.19 tree-shakes `defineVars` at the module/group boundary, not per
property. The 56 data variables intentionally form one semantic group: a build
emits zero data defaults when the module is unused and all 56 when any member is
used. The contract does not claim token-granular pruning that the compiler does
not provide.

## Non-goals

- Changing the names or values of the 56 canonical data defaults.
- Adding a separate CSS defaults asset or keeping a parallel plain-JavaScript
  token family as an independent source of truth.
- Making concrete themes repeat defaults they do not author.
- Scoping, renaming, or redesigning the three existing global `color-scheme`
  selectors.
- Changing scoped prose defaults, non-data token declarations, component
  overrides, adaptations, MediaTheme rules, icon output, or type augmentation.
- Defining the separate `@astryxdesign/build` source-build composition contract.
- Release scheduling and versioning beyond the breaking-minor requirement in
  FR17.
- Equivalent internal implementations remain valid when they satisfy this
  public contract.

## Requirements

### Canonical source, public API, and typing

- **FR1 — The public StyleX source owns every derived view.** The checked-in
  `dataTokens.stylex.ts` module MUST be the sole canonical source for all 56 names
  and default values. It contains the static object literal consumed by
  `stylex.defineVars()` and exports the public `dataVars` object.

  Generation MUST read that `.stylex.ts` source and produce:

  1. the existing plain `dataTokenDefaults` compatibility view without importing
     the StyleX value module into ordinary token-resolution graphs;
  2. `DataTokenName` and the theme-input validation inventory; and
  3. any generated documentation inventory.

  `dataTokenDefaults` MUST NOT be hand-maintained independently from `dataVars`.
  A repository check MUST fail when generated values, names, or types drift from
  the canonical `.stylex.ts` source. The canonical file MUST keep a static object
  literal because StyleX rejects an imported object as a `defineVars()` argument.

- **FR2 — Data variables are an explicit public StyleX subpath.** Core MUST
  export `dataVars` from
  `@astryxdesign/core/theme/dataTokens.stylex`. Every existing public custom
  property name remains byte-for-byte stable, for example:

  ```ts
  import {dataVars} from '@astryxdesign/core/theme/dataTokens.stylex';

  const positive = dataVars['--color-data-categorical-green'];
  ```

  The package export MUST use the same `source`, `types`, and `default` condition
  shape as `@astryxdesign/core/theme/tokens.stylex`; the existing StyleX
  `sideEffects` declaration continues to cover the source module. The focused
  subpath prevents ordinary Theme, token-resolution, or non-data component
  imports from retaining the StyleX variable group as a side effect.

- **FR3 — Tree-shaking is truthful at the group boundary.** A compiled graph
  with no value import from the data StyleX subpath MUST emit no
  `--color-data-*` default declarations. A graph that retains any `dataVars`
  value import MUST emit one canonical StyleX variable group containing all 56
  defaults. Importing one member is not required to prune the other 55.

  Distribution extraction MUST become dependency-aware as part of this
  implementation. Starting from a package's public entries, it MUST exclude an
  unreferenced variable-definition module and include a referenced cross-package
  StyleX variable dependency exactly once. Therefore an all-component Core CSS
  build with no data consumer omits the group, while a Lab package CSS build that
  contains `ChartCandlestick` includes it. The existing isolated file scan is not
  sufficient evidence for either result. Bundle evidence MUST report the raw and
  compressed cost of the retained group.

  Supported source and distribution integrations MUST place the emitted variable
  group in `@layer astryx-base`, like other Astryx StyleX output. An unlayered
  StyleX pipeline is outside the authored-theme-override guarantee in FR8–FR10 and
  MUST be diagnosed or documented rather than silently claimed as equivalent.

### Consumer behavior

- **FR4 — CSS-capable consumers use the public object.** Astryx TypeScript and
  TSX consumers MUST import `dataVars` when passing a selected value to StyleX,
  DOM styles, or SVG presentation attributes. They MUST NOT construct literal
  `var(--color-data-*)` strings. This includes default prop values such as
  candlestick up/down colors.

  CanvasRenderingContext2D and other non-CSS APIs MUST NOT receive `dataVars`
  `var()` references. They MUST use the existing concrete mode-resolved JavaScript
  path, such as `resolveThemeToken()` or `useTheme().token()`, consistent with
  FR13. The generated compatibility view keeps that resolver derived from the
  same canonical `.stylex.ts` source.

  Raw CSS and generated examples that cannot consume a TypeScript object MAY
  reference the same stable custom-property names only when their setup already
  guarantees that a compiled data-variable consumer retained the group, or when
  they provide an explicit local fallback. Documentation MUST not imply that a
  theme stylesheet itself materializes the defaults.

- **FR5 — Direct SVG and DOM values paint correctly.** A `dataVars` value passed
  directly to an SVG presentation attribute or DOM style MUST compile to the
  stable `var(--color-data-*)` reference and retain the variable-definition
  module in the build graph. Default and theme-overridden values MUST paint the
  expected fill and stroke. An undeclared data variable paints a candlestick
  body black and drops its wick stroke; that state MUST NOT recur.

### Sparse theme output

- **FR6 — Concrete themes emit only explicitly authored data values.** Runtime
  and static theme compilation MUST identify the authored input set before
  default resolution. For every explicitly authored `--color-data-*` name, the
  concrete theme emits that declaration in its existing `astryx-theme` donut:

  ```text
  @layer astryx-theme {
    @scope ([data-astryx-theme="ocean"]) to ([data-astryx-theme]) {
      :scope {
        --color-data-categorical-blue: light-dark(#0077B6, #48CAE4);
      }
    }
  }
  ```

  A theme that authors no data values emits none. A partial authoring set emits
  exactly that subset. Resolved defaults, compatibility maps, and inherited
  parent values MUST NOT be serialized as though the theme authored them.

- **FR7 — Theme build never emits raw global data defaults.** Neither runtime
  `<Theme>` injection nor standalone, multi-file, or family `theme build` output
  may emit canonical data defaults on `:root`, `html`, `body`, or another
  out-of-donut selector. Theme compilation MUST not call, inline, or retain a
  raw `generateDataTokenDefaultsCSS()` equivalent. The StyleX consumer graph is
  the only CSS-default owner.

  Removing the old defaults block MUST NOT remove its layer-order side effect.
  Every standalone, multi-file, family, and runtime theme output MUST retain an
  explicit order registration equivalent to:

  ```text
  @layer reset, astryx-base, astryx-theme;
  ```

  The registration contains no data declaration. It keeps `astryx-base` below
  authored theme overrides regardless of whether theme CSS or component CSS loads
  first.

### Cascade behavior

- **FR8 — Nested themes inherit every unspecified data value.** Same-identity and
  different-identity nested themes use normal custom-property inheritance. A
  child that authors no data value inherits the parent's effective value. A
  child that authors a subset replaces only that subset inside its donut; every
  omitted name continues to inherit. Changing identity alone does not reset the
  palette.

- **FR9 — Sibling roots remain isolated for authored overrides.** A scoped
  override in one Theme root MUST NOT affect a sibling Theme root. Both roots
  resolve unspecified names from the same retained StyleX canonical group.

- **FR10 — Dynamic identity switching selects only authored deltas.** Under the
  required `reset < astryx-base < astryx-theme` order, and when all target theme
  stylesheets are loaded, changing a root's theme identity MUST add, remove, or
  replace exactly the selected theme's authored data subset. Every omitted name
  returns to the inherited StyleX default or ancestor value. Physical stylesheet
  order MUST NOT change the winner after the layer order is registered. Selecting
  a built theme whose CSS is absent remains incomplete consumer setup.

- **FR11 — Light and dark keep existing resolution.** Canonical and authored
  `light-dark()` data values MUST resolve from the effective `color-scheme` as
  other StyleX variables do. Explicit light, explicit dark, system mode,
  MediaTheme, same-theme nesting, and different-theme nesting preserve the
  existing mode contract.

### Availability and JavaScript compatibility

- **FR12 — Availability follows actual StyleX use, not Theme presence.** If no
  compiled consumer retains `dataVars`, the output contains no data-variable
  defaults. When one consumer retains the group, standard StyleX 0.19 output
  declares the complete group on `:root` plus its variable-group class, exactly
  like existing canonical StyleX token groups. This global declaration is an
  accepted compiler consequence of the chosen canonical token system; it MUST
  NOT be attributed to or duplicated by theme build.

  In supported Astryx source and distribution integrations, the emitted group
  MUST be wrapped in `@layer astryx-base`. A bare StyleX transform emits the same
  selector without a layer; on the document root that unlayered default outranks a
  layered theme override and can miscolor portals. Such a pipeline is outside the
  themed-override guarantee and MUST be diagnosed or documented explicitly.

  Consumers that require data variables only inside a Theme MUST enforce that
  usage boundary in component structure. This contract does not claim that a
  retained StyleX `defineVars` group is absent from unthemed DOM.

- **FR13 — JavaScript token resolution remains compatible.** Existing
  `dataTokenDefaults`, `domainTokenDefaults`, `tokenDefaults`,
  `resolveThemeToken()`, `resolveThemeTokens()`, `useTheme().token()`, and
  `useTheme().tokens` names and return shapes remain available. Their canonical
  data values derive from FR1. This work MUST NOT turn the token APIs into
  computed-style readers or change their existing provider/no-provider
  semantics.

### Runtime, built, and family parity

- **FR14 — Runtime and built theme output are equivalent sparse deltas.** For the
  same theme input, runtime and static compilation emit the same authored data
  names, values, layer, selector, and donut boundary. Neither path emits
  defaults. Generated JavaScript remains `__built: true`; the marker continues
  to mean that concrete theme CSS is loaded and runtime compilation is skipped.
  No fallback data injection or second marker is added.

- **FR15 — Family output contains only member-authored subsets.** One family CSS
  file contains each selected member's explicit data overrides under that
  member's identity. A zero-data-delta member contributes no data declaration.
  The family file never repeats the canonical 56. Nested members follow FR8,
  switching follows FR10, and the family file emits the global color-scheme
  policy at most once.

### Global color-scheme compatibility

- **FR16 — Complete bundles may keep one compatible global environment policy.**
  A concrete bundle MAY continue to emit exactly these three rules:

  ```text
  @layer astryx-theme {
    :root { color-scheme: light dark; }
    html[data-theme="light"] { color-scheme: light; }
    html[data-theme="dark"] { color-scheme: dark; }
  }
  ```

  A standalone concrete bundle that emits the policy MUST emit all three
  byte-equivalent selectors, declarations, and layer ownership. A theme MUST NOT
  specialize, partially emit, reorder, or otherwise diverge from that policy. A
  standalone bundle MAY omit the policy only as a complete set. Family
  aggregation retains its existing identity-scoped color-scheme composition;
  this specification neither redesigns that composition nor treats it as a new
  concrete-theme policy. These environment declarations do not permit theme
  build to emit data defaults globally.

### Compatibility, migration, and documentation

- **FR17 — The ownership move uses the breaking 0.x path.** The first release
  that removes theme-build global defaults MUST use the repository's breaking
  change process: a minor version for affected 0.x packages, a breaking
  Changeset, and migration notes. The break is observable for raw data-variable
  consumers whose graph does not retain `dataVars`, consumers that relied on
  concrete theme CSS to define globals, and generated artifacts that still
  contain the old root block.

- **FR18 — Migration prefers public imports, not compatibility CSS.** Astryx
  component, fixture, example, and test migrations MUST replace constructible
  literal strings with `dataVars` references when the source is StyleX-capable.
  Upgrade tooling and regeneration MUST reject stale raw root defaults, identify
  direct raw consumers, and recommend the public StyleX import when appropriate.
  Raw CSS and generated templates that already carry explicit fallbacks remain
  valid after review. Migration MUST NOT add a legacy global-data theme mode,
  provider prop, sidecar stylesheet, arbitrary Theme wrapper, or invented
  fallback color.

- **FR19 — Theme input validation and CLI output remain truthful.** Every stable
  data name remains valid theme input and every unknown name remains rejected.
  Theme build keeps its current CSS/JS/declaration filenames and pairing, but
  generated CSS and docs MUST describe data declarations as authored sparse
  overrides. `--check` and upgrade validation MUST fail an old artifact that
  still contains the canonical root block or a theme-scoped un-authored default.

- **FR20 — Consumer docs distinguish three paths.** Documentation MUST show:
  (1) `dataVars` for StyleX-capable component code; (2) JavaScript token
  resolution for APIs that need concrete mode-resolved values; and (3) raw CSS
  custom-property use only with an explicit availability guarantee or fallback.
  It MUST state whole-group tree-shaking honestly and keep `@astryxdesign/build`,
  color-scheme compatibility, and release work outside this change.

### Platform support

- Supported browser floor: the existing Theme, StyleX, and `@scope` matrix.
- Unsupported behavior: browsers outside that floor retain the existing support
  policy; no global theme-build data fallback is added.
- Browser evidence: real Chromium computed styles and painted SVG values across
  the matrix in Verification.

## Current-state impact

Theme compilation currently owns the canonical data defaults. Runtime `<Theme>`
injection and every `theme build` mode emit one unconditional
`@layer astryx-base { :root { ...56 defaults... } }` block generated from the
plain `dataTokenDefaults` JavaScript object, while authored data values already
stay sparse inside the theme donut. Core StyleX CSS declares no data custom
property, and Astryx components that need a data color construct literal
`var(--color-data-*)` strings.

When this contract ships:

- the canonical palette becomes one public StyleX `dataVars` group;
- the compatibility defaults, types, validation, and docs derive from the same
  canonical record;
- unused compiled graphs emit zero data defaults and a retained group emits all
  56, matching StyleX's real grouping behavior;
- Astryx TSX consumers use the public object rather than literal strings;
- concrete standalone and family themes emit only authored scoped overrides;
- runtime and built theme paths emit no raw root data block;
- nested themes inherit omitted values and siblings isolate authored overrides;
- JavaScript resolution APIs and stable CSS names remain compatible;
- the three global `color-scheme` rules remain unchanged where emitted;
- generated JavaScript keeps `__built: true`; and
- CLI output filenames and the CSS/JS/type trio remain unchanged.

`architecture:theme-compilation` continues to own runtime/static sparse theme
output. `architecture:theme-application` continues to own provider nesting and
style lifetime. `architecture:theme-tokens` owns the shared token vocabulary and
derived compatibility views; the public StyleX data-token module owns canonical
CSS defaults. This record does not govern `@astryxdesign/build`.

## Verification

| Contract  | Verification                                                                | Representative states                                                                                                                           | Mutation or failure expectation                                                                                                                                          |
| --------- | --------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| FR1–FR3   | generator drift, public export, graph-aware compiler, and package CSS tests | all 56 names; unused graph; one retained member; cross-package dependency; source and precompiled builds; raw/gzip size                         | plain defaults drift; public key changes; unused build emits data vars; referenced package omits them; one use emits fewer/more than the complete group; duplicate group |
| FR4–FR5   | source audit, compiler fixture, component tests, real Chromium              | direct SVG fill/stroke; DOM style; Canvas concrete resolution; explicit props; canonical green/red; authored override                           | literal construction remains; direct CSS value does not retain definitions; Canvas receives `var()`; body paints black or wick disappears                                |
| FR6–FR7   | runtime/static/family structure and layer-order tests                       | zero/one/many authored names; all 56 canonical names; `:root`/html/body scan; theme CSS before/after component CSS                              | omitted default serialized; authored value outside donut; raw defaults remain; layer order flips                                                                         |
| FR8–FR11  | real-browser cascade matrix                                                 | same/different nesting; parent/child subsets; siblings; dynamic switch; light/dark/system/MediaTheme; portals; layered and unlayered source CSS | omission resets; sibling leaks; order/mode changes winner; unlayered root silently claims override parity                                                                |
| FR12–FR16 | compiler/runtime/build parity and environment-policy tests                  | no data consumer; retained layered group; runtime and built themes; standalone and family color-scheme composition                              | Theme presence emits defaults; built/runtime differ; family repeats defaults; global policy diverges                                                                     |
| FR17–FR20 | Changeset, codemod, CLI check, docs, and regeneration fixtures              | literal component/fixture use; raw CSS with/without fallback; old root artifact; ordinary/family build                                          | no breaking note; unsafe auto-rewrite; stale artifact passes; docs claim theme CSS supplies defaults or token-granular pruning                                           |

Real-browser verification MUST independently assert canonical and authored values,
not reuse generator output as the oracle. It MUST reproduce the
black-body/invisible-wick state with the variable declaration removed, then prove
correct SVG fill and stroke after the public StyleX import. It MUST cover default,
explicit prop, parent override, child subset override, same/different nested
identity, siblings, dynamic switching, light/dark values, and portal content that
inherits from the document root. Non-CSS verification MUST resolve the same
canonical and authored colors through the JavaScript token API and assert that a
Canvas assignment never receives a `var()` reference. An unlayered StyleX output
MUST be a red arm: it must demonstrate why the supported integration wraps
canonical defaults in `astryx-base` rather than being reported as equivalent.

Compiler verification MUST compile an unused entry and a one-member consumer.
The unused output contains zero `--color-data-*` defaults; the retained output
contains every canonical name exactly once in the StyleX variable group. It MUST
not claim per-property pruning. Distribution verification MUST start from real
package entries, resolve the cross-package StyleX variable dependency, prove Core
omits an unreferenced group and Lab retains a referenced group, and report raw and
gzip deltas.

Theme-output verification MUST enumerate all 56 canonical names and fail if an
un-authored canonical value appears in standalone, multi-file, family, or runtime
Theme CSS. It MUST fail on any raw `:root` data declaration from theme build and
on removal of the explicit `reset, astryx-base, astryx-theme` order registration.
Global color-scheme verification separately compares the complete standalone
three-rule policy across representative emitting bundles, asserts that a
non-emitting standalone bundle contains none of the three, and preserves existing
family composition.

### Completion criteria

This accepted specification remains incomplete until the implementation stack
proves:

- one canonical `.stylex.ts` source, a public `dataVars` export, and generated
  compatibility/type/validation views;
- truthful whole-group StyleX tree-shaking through graph-aware source and
  precompiled extraction;
- migrated Astryx consumers with no constructible raw data-var strings;
- sparse donut overrides and zero theme-build raw defaults across runtime,
  standalone, multi-file, and family modes;
- JS token API and theme-input compatibility;
- real Chromium SVG/cascade evidence, including the undeclared-variable red arm;
- regeneration and migration evidence for downstream theme artifacts; and
- independent architecture review plus green CI.

## Decision log

### DEC-1 — Public StyleX variables own canonical CSS defaults

**Reference:** `spec:AST-066/DEC-1`
**Decider:** `cixzhang`, `2026-10-01`

The data palette joins the canonical StyleX token system. The checked-in
`.stylex.ts` module owns the names and defaults, and components import its public
object with stable CSS names. Plain JavaScript defaults, types, validation, and
documentation remain generated compatibility views, not a second hand-maintained
authority.

Rejected: preserving `dataTokenDefaults` as an independent CSS generator input.
That is the parallel metadata architecture that allowed consumers and emitted CSS
to disagree.

### DEC-2 — Tree-shake one semantic 56-variable group

**Reference:** `spec:AST-066/DEC-2`
**Decider:** `cixzhang`, `2026-10-01`

StyleX 0.19 emits a complete `defineVars` group when its module is retained and
cannot prune individual object properties. One data palette group matches the
existing `colorVars` model, keeps the public API coherent, and gives an honest
zero-or-56 boundary. Precompiled package CSS must become graph-aware so this
module boundary remains truthful across packages rather than degenerating into a
repository file scan.

Rejected: claiming token-granular pruning, or splitting the palette across many
files solely to simulate it. Both would make the API and maintenance cost exceed
the demonstrated compiler capability.

### DEC-3 — Theme output contains authored deltas only

**Reference:** `spec:AST-066/DEC-3`
**Decider:** `cixzhang`, `2026-10-01`

Theme build owns customization, not canonical availability. It serializes only
explicit data inputs in the normal donut and never emits a raw root defaults
block. It preserves a declaration-only layer prelude so removing that block does
not invert `astryx-base` and `astryx-theme` when CSS load order changes.

Rejected: copying 56 defaults into every theme and keeping one unconditional
root block. The former duplicates defaults; the latter makes Theme presence,
not actual StyleX use, own the palette.

### DEC-4 — Nested omission inherits

**Reference:** `spec:AST-066/DEC-4`
**Decider:** `cixzhang`, `2026-10-01`

Same and different nested themes inherit every unspecified custom property and
replace only the authored subset. Identity alone is not a palette reset.

Rejected: treating an omitted value as an authored request for the canonical
default.

### DEC-5 — Accept standard StyleX root emission when the group is retained

**Reference:** `spec:AST-066/DEC-5`
**Decider:** `cixzhang`, `2026-10-01`

`stylex.defineVars(defaults)` emits its group on `:root` plus a variable-group
class. This is the same canonical mechanism as existing token groups. The strict
boundary in this decision is therefore ownership: unused graphs emit nothing and
theme build never emits data defaults globally.

Rejected: promising that retained canonical StyleX variables are absent from
unthemed DOM. Standard `defineVars` cannot make that promise; a manually scoped
parallel declaration or unconditional Theme class would contradict the chosen
source-of-truth and tree-shaking model.

### DEC-6 — Keep JavaScript resolution compatibility

**Reference:** `spec:AST-066/DEC-6`
**Decider:** `cixzhang`, `2026-10-01`

Existing resolver names, shapes, and mode behavior remain available from a
generated compatibility view. This lets CSS ownership change without forcing
callers that already need concrete values onto a DOM computed-style API.

Rejected: deleting `dataTokenDefaults` or changing `useTheme` into a cascade
reader. Neither is required to fix CSS ownership.

### DEC-7 — Keep one compatible global color-scheme policy

**Reference:** `spec:AST-066/DEC-7`
**Decider:** `cixzhang`, `2026-10-01`

The three root/html rules intentionally configure browser-wide `light-dark()`
and UA behavior. Complete theme bundles may repeat them when identical, or omit
the complete set. Tests prevent specialization or partial emission.

Rejected: scoping or splitting color-scheme packaging.

### DEC-8 — Migrate through an atomic stack and breaking minor

**Reference:** `spec:AST-066/DEC-8`
**Decider:** `cixzhang`, `2026-10-01`

The implementation separates canonical public StyleX ownership, consumer
migration, and theme-generator cleanup so each review has one reason to change.
The release uses a breaking 0.x minor with regeneration and consumer diagnostics.

Rejected: a legacy global-data mode. It would keep new artifacts on the behavior
this decision removes and make runtime/static ownership mode-dependent.

## Deprecation and cleanup records

### IFIX-0009 — Themes stop emitting raw global data-color defaults

| Field         | Value                                                                                                                                                                                                                                                       |
| ------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| id            | `IFIX-0009`                                                                                                                                                                                                                                                 |
| cleanup       | `CLN-0016`                                                                                                                                                                                                                                                  |
| package       | `@astryxdesign/core`, `@astryxdesign/cli`                                                                                                                                                                                                                   |
| surface       | The unscoped raw `:root` block of canonical data-color defaults that `Theme` runtime and `theme build` (standalone and family) emit for every theme                                                                                                         |
| authority     | FR6 (concrete themes emit only explicitly authored data values), FR7 (theme build never emits raw global data defaults), and FR12 (availability follows StyleX use). Owners: `spec:AST-066`: `cixzhang`                                                     |
| reproducer    | With the latest stable packages, a theme that authors no data colors emits every canonical data default in an unscoped root block, in runtime CSS and in `theme build` output                                                                               |
| affected      | CSS that reads a raw data-color custom property directly, relying on a theme to define it, without compiling a `dataVars` consumer; and stale generated theme CSS checked into an app                                                                       |
| matrix        | Theme with no authored data colors: every canonical default before; none after. Authored override: emitted before and after, scoped to its theme. StyleX `dataVars` consumers: same painted values before and after. Global `color-scheme` rules: unchanged |
| coexistence   | The public `dataVars` group carries the canonical values before and after, so a consumer that reads `dataVars` gets the same values on both                                                                                                                 |
| migration     | Read data colors through the public `dataVars` group, or author the needed values in the theme. Regenerate built theme CSS                                                                                                                                  |
| codemod       | `astryx upgrade` runs a validator that reports direct raw consumers and stale generated CSS; the rewrite depends on whether the consumer compiles StyleX                                                                                                    |
| downstream    | Maintained docs and templates read data colors through `dataVars`                                                                                                                                                                                           |
| rollback      | Restore the raw default block in runtime and `theme build` output from the final-patch baseline                                                                                                                                                             |
| harm of delay | Every theme keeps shipping a second global palette that survives without any consumer and can disagree with the canonical StyleX group                                                                                                                      |
| harm of apply | CSS that reads a raw data variable without `dataVars` or an authored value paints with the variable unset until it migrates                                                                                                                                 |
| state         | `proposed`                                                                                                                                                                                                                                                  |
| open decision | Whether a transition patch ships before the minor (`spec:AST-017` FR34)                                                                                                                                                                                     |

### CLN-0016 — Remove raw global data-color defaults from theme output

| Field     | Value                                                                                                                                              |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| id        | `CLN-0016`                                                                                                                                         |
| lifecycle | `IFIX-0009`                                                                                                                                        |
| delta     | Runtime and built themes emit only authored data values, scoped to their theme. Explicit layer order and global `color-scheme` rules are unchanged |
| rollback  | Restore the raw default block from the final-patch baseline                                                                                        |
| state     | `pending` — lands only in a minor release, once `IFIX-0009` is approved and that release's frozen manifest lists `CLN-0016`                        |

## Open questions

None.
