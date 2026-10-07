---
schema_version: 4
template_version: 2
kind: system-spec
id: spec:AST-068
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture: [architecture:theme-tokens]
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [theme, charts, cli/integrations/components]
---

# Chart-library theme adapters system spec

## Intent

A chart built with an Astryx package or a third-party renderer can use the same
active Astryx theme without creating a renderer-specific token vocabulary.
Builders receive one renderer-neutral chart-theme contract, official adapters
for selected libraries, and a self-service path for every other renderer.

The shared contract owns semantic chart colors, resolved mode-aware values,
customization choices, and conformance expectations. An adapter translates that
contract into its renderer's native configuration; it does not define another
theme or chart data model.

## Non-goals

- Define one universal chart specification, data model, component API, or
  interaction engine.
- Wrap every component or option exported by a supported chart library.
- Make every third-party chart library an Astryx-maintained adapter.
- Promise that visual theming alone makes a chart accessible.
- Prevent intentional brand, domain, or user-selected custom colors.
- Run palette generation during theme resolution, chart rendering, or adapter
  translation.
- Change the first-party `@astryxdesign/charts` composition model.
- Require equivalent internal implementations when they satisfy this public
  contract.

## Requirements

### Shared chart-theme contract

- **FR1 — One Astryx token graph serves every renderer.** First-party charts,
  official adapters, downstream adapters, and self-service integrations MUST
  consume the canonical Astryx token graph. An adapter MUST NOT introduce
  renderer-specific tokens such as `--recharts-grid-color` or
  `--vega-axis-color`.

- **FR2 — Renderer-neutral access does not require a renderer package.** Astryx
  MUST expose the chart-theme contract from a stable public surface that does
  not install Recharts, Vega, another third-party renderer, or the first-party
  chart runtime. The existing `useChartColors()`, `getChartColors()`, and
  `getChartColorsFromResolver()` meanings remain compatible: categorical order
  and wrapping, exact-stop sampling and interpolation, diverging midpoint
  construction, semantic and structural mappings, non-finite count handling,
  nearest-endpoint fallback for unparseable interpolation stops, alpha parsing
  and clamping, and unchanged unparseable alpha input. A package that currently
  exports those operations MAY retain compatibility re-exports after their
  renderer-neutral owner is available.

  `buildVegaLiteConfig()` remains the canonical public Vega-Lite configuration
  builder. A shared adapter contract MUST extend or delegate through that
  operation rather than create a parallel builder with overlapping meaning.

- **FR3 — Core owns one closed chart-color meaning; adapters own syntax.** The
  renderer-neutral contract is exactly the existing `ChartColorsAPI`:

  | Meaning                                              | Canonical source                                                                                        |
  | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------- |
  | `categorical(n)`                                     | the ten `--color-data-categorical-*` tokens in canonical order, wrapping after slot ten                 |
  | `sequential.<hue>(n)`                                | five ordered stops for blue, shamrock, orange, pink, purple, red, teal, yellow, and gray                |
  | `diverging.positiveNegative(n)`                      | shamrock and red ramps with `--color-data-gray-1` as the odd midpoint                                   |
  | `diverging.coldHot(n)`                               | blue and red ramps with `--color-data-gray-1` as the odd midpoint                                       |
  | `diverging.custom(negative, positive, n, midpoint?)` | two named sequential ramps and the caller midpoint or `--color-data-gray-1`                             |
  | `semantic`                                           | categorical green, red, orange, and `--color-data-neutral` for positive, negative, warning, and neutral |
  | `structural`                                         | emphasized border for axis and tick, border for grid, and secondary text for label                      |
  | `alpha(color, opacity)`                              | the preserved parsing, clamping, and unchanged-unparseable behavior in FR2                              |

  The shared contract MUST NOT add renderer-shaped fields such as Recharts prop
  bundles, Vega config paths, ECharts options, or Chart.js scale options. One
  shared `structural.grid` meaning may translate to `CartesianGrid.stroke`,
  `config.axis.gridColor`, `splitLine.lineStyle.color`, or
  `scales.*.grid.color` in separate adapters. Typography, spacing, focus,
  selection, and other behavior remain existing foundation tokens or
  renderer/wrapper concerns unless a separate current contract admits another
  renderer-neutral chart semantic.

- **FR4 — CSS and concrete values share one source.** CSS-capable SVG and DOM
  consumers MAY use the public data-variable references. Canvas, WebGL,
  serialized configurations, server rendering, tests, and color math MUST use
  the canonical JavaScript resolver to obtain concrete mode-resolved values.
  The shared contract MUST NOT require `getComputedStyle()` or maintain a
  second palette. Unsupported expressions remain explicit failures or
  documented degradation rather than guessed colors.

### Tokens, palettes, and caller customization

- **FR5 — This record does not admit new chart tokens.** Adapter semantics MUST
  first map to the existing 56-token data group and existing semantic foundation
  tokens. Recharts grid stroke, Vega axis grid color, ECharts split-line color,
  and Chart.js grid color therefore map to one chart-grid meaning backed by the
  existing border role.

  A distinct portable token requires a same-change amendment to
  `spec:AST-066` and `architecture:theme-tokens`, including source-of-truth,
  compatibility, generation, and visual evidence. A library exposing another
  color field is not by itself evidence for a new raw palette value.

- **FR6 — Authored theme values retain ownership before runtime.** Theme authoring
  source MAY assign a chart token a literal value or an explicit reference to an
  accepted committed-palette value. That source resolves the palette-file
  reference to an ordinary theme value before `defineTheme()` receives it.
  Canonical token resolution subsequently handles mode expressions and
  token-to-token references. Runtime chart helpers and adapters observe only the
  effective token value; they do not know palette identity or generation
  provenance. They MUST NOT run the palette generator, infer a nearest raw
  palette color, or silently replace an authored value.

- **FR7 — Chart editors preserve automatic, theme, and custom intent.** The
  serializable choice is one of `{kind: 'automatic'}`,
  `{kind: 'theme', token: DataTokenName}`, or
  `{kind: 'custom', value: string}`. A public option projection lets an editor
  present a curated, chart-safe set from the active theme. Each projected theme
  option has a stable token identifier, a mode-resolved preview value, and enough
  metadata to label the choice without storing the preview as identity.

  Automatic follows the chart's assigned series role. A theme choice updates
  with theme or mode. An explicit custom choice remains fixed until the caller
  changes it. A theme token remains a valid stored choice when it is omitted
  from a later curated picker projection; removing or renaming the canonical
  token is a breaking migration. An unknown token or malformed custom color
  produces a structured validation failure, and an adapter that must continue
  rendering uses the automatic choice with a documented diagnostic rather than
  guessing a replacement. The option projection MUST NOT present every raw
  palette stop as a chart-safe semantic choice or label an isolated color
  accessible without contextual contrast evidence.

- **FR8 — Legend defaults preserve series association.** A legend swatch follows
  its associated series color by default, while legend text uses the shared
  structural label meaning. A caller MAY intentionally override a legend item
  through the renderer's native content seam. The override wins only for that
  legend item; it never changes the plotted series or active theme, and the
  caller owns preserving a perceivable association with the series. A one-off
  swatch override MUST NOT create a theme token. A distinct portable legend role
  requires the separate token-authority amendment in FR5.

### Adapter behavior and package boundaries

- **FR9 — Adapters translate into native renderer contracts.** Each adapter maps
  shared semantics to its renderer's supported props, options, configuration,
  components, or update operations. It MUST preserve the renderer's native data
  model and documented escape hatches rather than forcing consumers through a
  lowest-common-denominator Astryx chart schema.

- **FR10 — Official adapters are isolated integration packages.** An official
  adapter ships separately from Core and `@astryxdesign/charts`, contains no
  private dependencies, and treats its renderer plus Astryx and framework
  runtimes as peer dependencies where applicable. It declares a narrow supported
  renderer-version range and MUST NOT bundle a second renderer copy. Recharts
  uses a dedicated public integration package; Vega and Vega-Lite remain in
  their dedicated integration package.

- **FR11 — Theme and preference changes use the renderer's safe update path.** An
  adapter updates when the effective Astryx theme or color mode changes and uses
  the renderer's supported update mechanism while preserving interaction state
  where that renderer permits. Each integration also owns a documented
  reduced-motion policy: a React adapter observes the user preference, a
  non-React caller supplies it explicitly, and an unknown or server-only state
  defaults to no animation. A theme switch MUST NOT introduce motion when reduced
  motion is active. Renderer limitations are documented instead of hidden behind
  a false parity claim.

### Support tiers and self-service integrations

- **FR12 — Support is tiered and explicit.** Astryx publishes four distinct
  support levels:

  1. the renderer-neutral core contract, maintained for every consumer;
  2. official adapters, with Astryx-owned compatibility and conformance evidence;
  3. reference integrations, which demonstrate mappings without a compatibility
     guarantee; and
  4. community adapters, which consume the public contract but retain their own
     release and support policy.

  The existence of a mapping example, package name, or community adapter MUST
  NOT imply official support.

- **FR13 — Official adapter admission requires durable ownership.** A renderer
  becomes official only when demonstrated adoption, a material capability need,
  a named maintainer, an upstream API stable enough to support, a documented
  version range, and the theme-adapter conformance evidence in FR16 all exist.
  Recharts and Vega/Vega-Lite are the initial official-adapter targets; neither
  gains official status until it passes this gate. Loss of ownership or
  sustainable compatibility triggers an explicit deprecation path rather than
  indefinite best-effort support.

- **FR14 — Unsupported renderers receive a self-service integration contract.**
  The public surface MUST provide React and non-React color resolution, stable
  chart-color options for authoring UIs, a semantic mapping guide, an
  adapter-authoring guide, a reduced-motion policy with an explicit non-React
  input and no-animation unknown default, and a reusable theme-conformance kit.
  The adapter-authoring guide lives in the CLI integration component authoring
  docs under an advanced section, where downstream component authors already
  learn the public integration contract. Admitted official integrations serve as
  reference implementations. A community adapter that later satisfies FR13 has
  a documented path to official review without changing its semantic token
  source.

- **FR15 — Downstream packages extend instead of forking.** A public or private
  downstream package MAY wrap, re-export, preset, or add product-specific data
  models and interactions on top of the shared contract or an official adapter.
  It MUST NOT copy the canonical token mapping into a competing theme source.
  Product-specific behavior remains downstream while effective colors, mode
  resolution, and conformance stay aligned with Astryx.

### Quality, accessibility, and compatibility

- **FR16 — Official adapters pass one theme-conformance profile.** Adapter-owned
  conformance covers categorical, sequential, diverging, semantic, and structural
  colors; light, dark, and custom themes; runtime switching; automatic, theme,
  and custom color choices; reduced-motion update policy; native escape hatches;
  backend paint; documented degradation; and renderer-version compatibility.
  CSS, SVG, Canvas, and WebGL paint paths are tested separately when a renderer
  supports more than one backend.

- **FR17 — Renderer, wrapper, and caller behavior stays with its capable owner.**
  Responsive layout, mark-level keyboard interaction, focus navigation, tooltip
  announcement, summaries, and equivalent data alternatives belong to the
  renderer, a behavior-owning wrapper, or the product caller according to which
  layer has the data and interaction model needed to enforce them. A thin theme
  adapter MUST document the ownership and known gaps but MUST NOT claim or
  simulate behavior it cannot verify. Canvas and WebGL callsites provide an
  authored accessible alternative when rendered marks are not exposed.

- **FR18 — Compatibility follows the public contract.** An adapter publishes its
  supported renderer range and tests the minimum and representative versions in
  that range. Narrowing the range, removing a compatibility re-export, changing
  the observable Charts color-helper behavior preserved in FR2, replacing
  `buildVegaLiteConfig()`, or changing a `ChartColorChoice` discriminant follows
  the normal breaking-change and migration contract. Experimental upstream APIs
  remain capability-detected or unsupported until their stable release is
  admitted.

### Platform support

- Supported feature/engine floor: the current Astryx theme and JavaScript token
  resolver floor plus each official adapter's published renderer matrix.
- Unsupported behavior: a renderer outside the official matrix receives the
  self-service contract but no Astryx compatibility guarantee.
- Browser evidence: representative SVG/DOM, Canvas, and WebGL output verifies
  painted values, runtime theme changes, and reduced-motion update policy where
  each backend applies. Focus behavior and an accessible alternative are verified
  only by an integration that claims and owns those behaviors under FR17; every
  other adapter verifies truthful ownership and limitation documentation.

## Current-state impact

The canonical data-visualization token family and JavaScript token resolution
already belong to the Core theme graph under `architecture:theme-tokens` and
`spec:AST-066`. `@astryxdesign/charts` currently exposes the chart-color helper
operations from its canary package. The separate Vega package exports
`buildVegaLiteConfig()` with its own token mapping but does not consume a public
renderer-neutral adapter contract. No public Recharts adapter exists.

The renderer-neutral helper surface is owned independently from the first-party
renderer. It preserves compatibility re-exports, includes the chart-editor
option projection, and publishes official, reference, community, and
self-service support boundaries. No adapter behavior is available until an
implementation satisfies this contract.

`architecture:theme-tokens` continues to own canonical token names, defaults,
references, and JavaScript resolution. `spec:AST-066` continues to own data-token
CSS and JavaScript source-of-truth behavior. `@astryxdesign/charts` owns its chart
model and components. Each official integration package owns only translation,
renderer compatibility, and the adapter-specific portion of conformance.

## Verification

| Contract             | Verification                                                                                         | Representative states                                                                                                               | Mutation or failure expectation                                                                                       |
| -------------------- | ---------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| FR1–FR6              | public export, token-resolution, and source audits                                                   | default and authored themes; explicit data override; semantic reference; canonical fallback; CSS and concrete outputs               | an adapter adds renderer tokens, bypasses the token graph, reads computed style, or generates/invents a palette value |
| FR7–FR8              | color-option and legend fixtures                                                                     | automatic, stable theme identity, custom literal, mode switch, series-derived swatch, explicit legend override                      | a preview value becomes stored identity, custom paint changes with theme, or legend override creates a token          |
| FR9–FR11             | adapter contract and runtime integration tests                                                       | native configuration; theme/mode switch; preserved renderer state; reduced motion; unsupported feature                              | an adapter replaces the renderer model, bundles it, or animates a preference-only update under reduced motion         |
| FR12–FR15            | support metadata, authoring-guide examples, and conformance-kit self-test                            | core-only; official; reference; community; downstream wrapper; promotion and deprecation                                            | an example implies support, an ownerless adapter becomes official, or a downstream package forks token meaning        |
| FR16–FR18            | per-adapter theme matrix, real-browser paint evidence, ownership review, and supported-version tests | light/dark/custom; SVG/DOM, Canvas, WebGL; state color mapping; reduced-motion update; minimum and representative renderer versions | backend paint diverges, behavior ownership is misstated, or an in-range renderer breaks without migration             |
| Repository integrity | knowledge validation, public-content check, formatting, and changed-file review                      | durable public record and every implementing change                                                                                 | research, private context, project narration, or unrelated policy enters the record                                   |

## Decision log

### DEC-1 — Share semantic meaning, not renderer syntax

**Reference:** `spec:AST-068/DEC-1`
**Decider:** `rubyycheung`, `2026-10-07`

One renderer-neutral contract owns chart semantics and every adapter translates
those meanings into its native API. This keeps themes aligned without replacing
the renderer's data model or composition surface.

Rejected: one universal renderer-shaped theme object. It either leaks library
fields into Core or reduces every integration to an inadequate common subset.

### DEC-2 — Map semantics before adding tokens

**Reference:** `spec:AST-068/DEC-2`
**Decider:** `rubyycheung`, `2026-10-07`

Renderer color fields first map to existing shared meanings. AST-068 admits no
new token; a distinct role requires a separate amendment to the canonical token
authority. Accepted theme palette references and explicit authored values remain
the value owners.

Rejected: adding raw or renderer-named colors for every available styling field.

### DEC-3 — Preserve caller intent in chart color editors

**Reference:** `spec:AST-068/DEC-3`
**Decider:** `rubyycheung`, `2026-10-07`

Automatic assignment, a stable theme-token choice, and an exact custom color are
separate caller intents. Theme choices remain adaptive; custom choices remain
fixed; preview values never become token identity by accident.

Rejected: storing every selection as its currently resolved hex value.

### DEC-4 — Make support a maintained tier, not a package-shaped implication

**Reference:** `spec:AST-068/DEC-4`
**Decider:** `rubyycheung`, `2026-10-07`

Official support requires adoption, need, ownership, a stable upstream surface,
and conformance evidence. Recharts and Vega/Vega-Lite are initial targets;
other renderers receive reference or community status plus the complete
self-service contract until they independently pass the admission gate.

Rejected: publishing first-party adapters for every chart library with no durable
owner or compatibility budget.

### DEC-5 — Keep official adapters thin and isolated

**Reference:** `spec:AST-068/DEC-5`
**Decider:** `rubyycheung`, `2026-10-07`

Each official adapter is a separate integration package with renderer peer
dependencies. It translates theme semantics and preserves native renderer APIs;
Core and first-party Charts do not inherit the renderer dependency.

Rejected: wrapping every chart component or adding third-party renderers to Core
or `@astryxdesign/charts`.

### DEC-6 — Give unsupported renderers a complete self-service path

**Reference:** `spec:AST-068/DEC-6`
**Decider:** `rubyycheung`, `2026-10-07`

Stable resolvers, color-option metadata, mapping guidance, authoring guidance, and
a conformance kit let downstream and community integrations remain aligned
without an Astryx-owned adapter.

Rejected: limiting the shared contract to libraries with official packages.

## Open questions

- **OQ1 — Renderer-neutral public path.** Does the contract live at a focused
  Core subpath or in a dedicated dependency-free package? Existing Charts
  exports remain compatibility re-exports in either case. (`human-api`)
- **OQ2 — Color-choice operation names.** Which public verbs separately own
  projection, validation, and resolution of the fixed `ChartColorChoice` union
  while satisfying `spec:AST-002`? (`human-api`)
