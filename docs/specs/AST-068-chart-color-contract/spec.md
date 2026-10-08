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
affects_architecture:
  [architecture:theme-tokens, architecture:theme-application]
affects_families: []
affects_contributing: [contributing:api-conventions]
affects_consumer_docs: [theme, charts, cli/integrations/components]
---

# Chart color choices and renderer transport system spec

## Intent

An end user can keep a chart series on its automatically assigned theme color,
choose a stable Astryx theme color for that chart, or set an exact custom color
without changing the active theme. Automatic is not a color value: it is the
absence of a chart-local override, so the product assigns a theme token from the
series' stable identity. A stored theme choice follows light, dark, and custom
themes; a stored custom choice remains exact. Reset returns to Automatic by
deleting the override.

Chart components translate that same color intent into the representation their
renderer consumes. A live DOM or SVG paint may use a CSS reference. JavaScript
options, Canvas, serialized configuration, workers, server output, and exports
use a concrete portable color. GPU integrations use explicitly normalized color
channels. Theme changes reach an existing renderer through its supported update
path rather than defining a renderer-specific Astryx theme.

The public contract keeps stable user intent, picker projection, validation, and
renderer resolution distinct. It uses the canonical data-token system and does
not introduce Recharts-, Vega-, ECharts-, Plotly-, or Chart.js-specific token
names.

## Non-goals

- Define a universal chart component, data model, specification, interaction
  engine, tooltip API, or accessibility implementation.
- Make every chart library an Astryx-supported integration or promise
  compatibility with a third-party release.
- Expose every stop from a generated authoring palette as a chart-safe end-user
  choice.
- Treat a color as accessible without its rendered surface, geometry, text role,
  neighboring colors, and non-color encodings.
- Standardize gradients, patterns, images, blend modes, color spaces beyond the
  initial solid-color contract, or renderer-owned runtime paint objects.
- Persist renderer options, resolved preview colors, palette array indexes,
  theme mode, callbacks, DOM objects, Canvas objects, or GPU resources.
- Change the names, defaults, CSS ownership, or sparse override behavior of the
  canonical data-token group owned by `spec:AST-066`.
- Require equivalent internal implementations when they satisfy this contract.
- Internal modules, files, function names, algorithms, data structures, storage
  layouts, manifests, journals, locks, transaction protocols, and CI job/workflow
  topology belong in architecture or implementation unless callers or
  interoperating systems intentionally depend on that exact mechanism as a public
  protocol. In that case, state who depends on it and why an equivalent
  implementation would not satisfy the contract.

## Requirements

### Stored end-user intent

- **FR1 — Automatic is the absence of a series override.** A chart series with no
  stored color override uses the product's automatic assignment. Reset MUST
  delete the override. Persistence MUST NOT store the automatic slot, its current
  token, or its resolved color as though the end user selected it.

- **FR2 — A persisted override has one closed meaning.** The stable serialized
  intent MUST distinguish exactly:

  1. a theme choice that stores a supported stable chart-color token identity;
     and
  2. a custom choice that stores one normalized portable solid color.

  A theme choice MUST NOT store the current resolved color. A custom choice MUST
  NOT become a theme token or modify the active theme. The initial custom-color
  grammar MUST be closed and canonical; accepting the browser's open-ended CSS
  color grammar without a portable normalization result is not conforming.

- **FR3 — Stored intent is renderer-neutral.** Persistence MUST NOT contain CSS
  custom-property text, Vega signals, Recharts props, Chart.js options, ECharts
  option paths, Plotly trace paths, D3 scale state, Canvas runtime objects, GPU
  channel arrays, or another renderer's configuration. Renderer representations
  are derived at use time from validated intent, theme, and mode.

### Picker projection and palette identity

- **FR4 — Projection, validation, and resolution are separate operations.** The
  public contract MUST provide independent roles for:

  - projecting the curated ordered choices currently offered by a picker;
  - validating stored input without consulting whether it is currently offered;
    and
  - resolving valid intent for an explicit theme and mode.

  Removing a supported token from the picker projection MUST NOT invalidate a
  already persisted use of that token. Projection MUST NOT be treated as the
  complete token-validation inventory.

- **FR5 — The picker projects stable chart-color identities.** Every projected
  choice MUST carry a stable machine identity and a current resolved preview.
  Projection order and membership are public compatibility. Token IDs are not
  user-facing labels; products own localized labels, grouping, search terms,
  accessible swatch names, and picker layout.

- **FR6 — The default projection is chart-safe and curated.** The default picker
  projection MUST be an explicit subset of canonical data-token identities. It
  MUST NOT enumerate all general UI color tokens or every raw generated palette
  stop. Categorical choices preserve one documented order. Sequential ramps and
  other scale-oriented groups MUST remain distinguishable from categorical
  solid-color choices.

- **FR7 — Generated palettes enter through explicit stable slots.** A theme may
  map values from its generated palette into supported chart-color tokens. The
  picker then shows those current values under the stable token identities. The
  runtime MUST NOT inspect a theme package's raw generated palette, infer chart
  colors from an accent, or regenerate a palette during projection or
  resolution. A theme that authors no chart-color override inherits canonical
  data-token values under `spec:AST-066`.

### Validation, failure, and migration

- **FR8 — Validation returns structured failure.** Validation MUST reject unknown
  discriminants, unsupported token identities, malformed custom colors, and
  non-canonical persisted shapes with a structured diagnostic. A renderer that
  must continue after invalid persisted input MUST use Automatic and surface the
  diagnostic through the host's supported reporting seam. It MUST NOT guess a
  nearby token, preserve an untrusted string, or freeze the last resolved color.

- **FR9 — Projection changes do not rewrite intent.** A token value change
  intentionally updates every theme choice that stores that token, without a
  persisted-data migration. Removing a token from picker projection does not
  rewrite or invalidate it while the token remains supported. Renaming or
  removing a supported persisted identity is a breaking API and data migration.

- **FR10 — Custom colors remain exact.** A valid custom choice resolves to the
  same canonical solid color in every theme and mode. Products MUST recompute
  its preview and contextual contrast when theme, mode, rendered surface, or
  neighboring colors change. The contract does not silently adapt, recolor, or
  replace the custom choice.

### Renderer-ready resolution

- **FR11 — Each transport has one explicit representation.** A verified live
  DOM or SVG pass-through path uses the public `dataVars` object so StyleX owns
  the CSS reference and retains its declarations. Resolving a valid theme or
  custom choice returns:

  - a canonical concrete sRGB color for JavaScript options, color math, Canvas,
    serialization, workers, server rendering, and export; and
  - normalized RGBA channels in a documented range for GPU integrations.

  The renderer-free resolver MUST NOT construct a data-token custom-property
  reference. A caller MUST NOT infer numeric channel range, alpha convention, or
  color format from a generic array. A custom-property reference is not a
  concrete color, and a concrete CSS string is not automatically a GPU value.

- **FR12 — CSS references require direct browser ownership.** A CSS reference MAY
  be used only when the integration verifies that the value reaches a live
  DOM/SVG CSS or presentation property without library parsing, interpolation,
  luminance calculation, export conversion, Canvas assignment, or another
  JavaScript color operation. Library output that happens to preserve a string
  without a supported contract MUST NOT be generalized to its other renderers or
  paths.

  `dataVars` use retains the complete atomic group and follows authored theme
  overrides only under the supported layered StyleX integration boundary owned
  by `spec:AST-066`. Documentation MUST state that an unlayered StyleX pipeline
  is outside that override guarantee.

- **FR13 — Concrete resolution is theme-and-mode explicit.** React callers pass
  the `token` resolver from the nearest supported `useTheme()` context. Non-React,
  worker, server, test, and export callers provide a resolver over an explicit
  theme and effective light or dark mode. Resolution MUST NOT depend on DOM
  computed style outside a verified live CSS-reference path.

  The concrete token resolver does not observe arbitrary descendant CSS,
  `MediaTheme`, on-surface adaptation, or every scoped cascade override. An
  integration whose output must match one of those surfaces owns an explicit
  surface mapping rather than claiming resolver/cascade equivalence.

- **FR14 — Runtime paint objects remain renderer-owned.** Canvas gradients,
  Canvas patterns, image paints, renderer class instances, and GPU resources are
  constructed locally from serializable intent or descriptors. They are not
  stored as color choices and do not widen the initial solid-color contract.

### Theme updates and renderer lifecycle

- **FR15 — A theme change uses the renderer's live update seam.** A change in
  resolved chart values is an update signal, not permission to recreate the
  renderer. Integrations MUST keep the same chart key and component position.
  When the renderer supports live updates, the integration updates existing
  props, options, Canvas state, signals, uniforms, or buffers and requests the
  renderer's normal redraw.

- **FR16 — State loss is explicit when live update is unavailable.** Recreating a
  renderer can discard focus, selection, zoom, hover, tooltip, animation,
  streaming buffers, and GPU resources. An integration that cannot apply theme
  values in place MUST snapshot and restore the supported state or document and
  verify the reset as a caller-visible limitation. It MUST NOT claim seamless
  runtime theme switching.

- **FR17 — Workers receive a bounded resolved payload.** A worker or
  OffscreenCanvas integration receives a structured-cloneable subset containing
  only the values it uses plus a theme revision or equivalent change marker. It
  MUST NOT receive React hooks, the full token inventory, CSS references that
  depend on a document cascade, DOM/Canvas objects, or callbacks.

- **FR18 — Server and export output is self-contained.** SSR, SVG/PDF/PNG export,
  email, image generation, and other detached output MUST resolve an explicit
  theme and mode and bake portable values into the output. A self-contained
  artifact MUST NOT require the viewer's ambient Astryx CSS to recover its
  colors. A server MUST NOT infer a client's system color preference.

### Automatic assignment, legends, and accessibility

- **FR19 — Automatic assignment follows stable series identity.** Products assign
  automatic categorical slots by stable series identifier, not observation,
  current sort, filtering, pagination, streaming arrival, or render order. The
  identifier-to-slot mapping persists while the chart document exists. When
  simultaneous categories exceed the distinct curated slots, the product MUST
  group or reduce categories or add another visual encoding; it MUST NOT
  silently recycle colors when two visible series would become indistinguishable.

- **FR20 — One final series color feeds every representation.** Marks, legends,
  tooltips, annotations, and textual data alternatives derive from the same
  validated and resolved series color. A renderer-native legend-only override is
  local and optional; it does not change stored series intent or the plotted
  series and requires another perceivable association cue.

- **FR21 — Accessibility remains contextual and shared.** Projection and
  resolution MUST NOT label an isolated color accessible. Products verify text
  and marks against their actual surfaces and modes, preserve keyboard and touch
  access to equivalent information, provide non-color distinctions where color
  carries meaning, and expose a readable data alternative when visual marks are
  insufficient.

### Packaging, compatibility, and documentation

- **FR22 — The stable contract has no renderer dependency.** The public surface
  that owns chart-color identities, projection, validation, and resolution MUST
  NOT install Recharts, Vega, D3, Chart.js, ECharts, Plotly, Highcharts, a Canvas
  implementation, or a GPU runtime. Library integrations translate the stable
  contract into their native APIs and own their compatibility range.

- **FR23 — Existing experimental helpers do not silently become authority.** A
  canary or private helper that returns resolved color arrays MAY delegate to the
  stable contract after compatibility review. Its private ordering, wrapping,
  interpolation, fallback, or package location does not become stable merely
  because code exists. Duplicate legacy helpers MUST converge or remain clearly
  experimental.

- **FR24 — Consumer docs describe capabilities, not universal adapters.** Public
  guidance MUST distinguish live CSS pass-through, concrete JavaScript colors,
  Canvas redraw, GPU normalization, serialized configuration, worker transport,
  SSR/export, and renderer lifecycle. A library-specific guide is an example, not
  an Astryx support guarantee, unless a separate tested compatibility contract
  says otherwise.

  Builder docs own Automatic/theme/custom behavior, Reset, persistence,
  localization, contextual validation, legend association, and migration
  presentation. Contributor verification workflow, admission gates, and internal
  maintenance process stay outside consumer docs.

### Platform support

- Supported feature/engine floor: the existing Astryx Theme, StyleX, and token
  resolver matrix; individual renderer integrations additionally declare their
  own supported versions and rendering backends.
- Unsupported behavior: a renderer path that cannot consume one of the explicit
  outputs must reject or adapt it through a documented renderer-owned seam; it
  must not pass through an incompatible representation and rely on fallback
  paint.
- Browser evidence: real-browser paint and update evidence across DOM/SVG,
  Canvas, and GPU paths, plus detached serialization/export evidence.

## Current-state impact

`spec:AST-066` owns canonical data-token names, defaults, the StyleX variable
object, sparse authored theme overrides, and concrete token-resolution behavior.
This record owns the chart-local persistence model, the closed supported identity
inventory, picker projection, validation, concrete chart-color outputs, and
renderer lifecycle boundary over that token system. It does not change token
ownership.

`architecture:theme-tokens` owns the shared token vocabulary and derived views.
`architecture:theme-application` owns theme identity, mode, nesting, and lifetime.
The renderer-free chart-color subpath owns no React, StyleX, or renderer runtime.
Products own Automatic assignment, localized picker labels, document storage,
and diagnostic presentation. Renderer packages own library syntax, lifecycle,
version compatibility, and runtime resources.

Generated palettes remain authoring inputs. Themes map selected generated values
into stable chart-color token slots through explicit overrides. Consumer docs
show only the implemented capability boundaries and identify renderer rebuild or
state-reset behavior where it exists.

## Verification

| Contract  | Verification                                         | Representative states                                                                                                 | Mutation or failure expectation                                                                                  |
| --------- | ---------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| FR1–FR3   | serialization and round-trip tests                   | absent override; theme choice; custom choice; Reset; JSON/document storage                                            | Automatic value persisted; resolved color stored as identity; renderer field enters persisted shape              |
| FR4–FR7   | generated inventory/projection drift tests           | categorical order; sequential grouping; default theme; partial custom overrides; generated palette mapping            | projection doubles as validation; raw UI/palette stops leak; runtime regenerates palette; order drifts           |
| FR8–FR10  | validator and migration fixtures                     | unknown discriminant/token; malformed custom value; removed projection item; renamed token; theme/mode/surface change | invalid input guessed; removed option invalidates stored token; custom color adapts silently                     |
| FR11–FR14 | format and renderer-boundary tests                   | CSS reference; concrete sRGB; RGBA channels; Canvas option; GPU uniform; gradient/pattern exclusion                   | `var()` reaches parser/Canvas/GPU; channel range is ambiguous; runtime object is persisted                       |
| FR15–FR18 | real-renderer lifecycle and detached-output evidence | Recharts/SVG; Canvas redraw; Vega signal/config; GPU uniform; worker payload; SSR/export                              | theme key remounts chart; interaction state silently resets; worker gets full tokens; export needs host CSS      |
| FR19–FR21 | assignment, legend, and accessibility fixtures       | reorder/filter/page/stream; ten and excess categories; legend override; light/dark/custom surfaces                    | assignment follows observation order; visible colors silently recycle; legend diverges; color-only meaning       |
| FR22–FR24 | package-boundary, compatibility, and docs checks     | stable owner import; experimental helper; library examples; public guidance                                           | stable surface installs renderer; private behavior becomes contract accidentally; docs promise universal support |

Real-renderer evidence MUST include:

- direct SVG paint with a supported layered `dataVars` integration and one
  custom theme override;
- a runtime mode/theme change that preserves the same DOM/SVG chart instance;
- a Canvas renderer that updates concrete colors and redraws without recreating
  its instance;
- a serialized Vega-style configuration that survives JSON round-trip and either
  updates live values or declares and verifies state reset on rebuild;
- a GPU path that converts canonical concrete color into documented RGBA
  channels and updates an existing uniform or buffer;
- worker payload structured-clone round-trip; and
- detached SVG/raster output that contains its resolved colors without host CSS.

Palette evidence MUST keep stable IDs while preview values change across light,
dark, and a custom theme. It MUST reorder or remove a projected option without
invalidating an otherwise supported persisted token, and it MUST prove that an
unknown persisted token falls back to Automatic with a diagnostic.

## Decision log

### DEC-1 — End-user chart overrides do not mutate the theme

**Reference:** `spec:AST-068/DEC-1`
**Decider:** `rubyycheung`, `2026-10-07`

Automatic, theme-aware, and exact custom color choices are chart-document state.
A theme choice stores stable Astryx identity and a custom choice stores exact
validated color; neither edits the active theme.

Rejected: applying an end user's chart color through a global theme override,
because one chart edit would change unrelated charts and components.

### DEC-2 — Renderer capability selects the output representation

**Reference:** `spec:AST-068/DEC-2`
**Decider:** pending owner review

The stable contract preserves one color intent and separates the public `dataVars`
direct-CSS path from concrete and GPU resolver outputs. Integrations choose by the
actual consumption boundary, not by a library-wide label such as SVG or Canvas.

Rejected: one string value for every renderer, because libraries parse colors,
perform color math, export through different backends, and require incompatible
runtime paint formats.

### DEC-3 — Theme palettes map into stable chart slots explicitly

**Reference:** `spec:AST-068/DEC-3`
**Decider:** pending owner review

A theme author selects generated palette values for stable chart-color tokens.
The end-user picker projects those chart-safe identities and current previews.
Raw generated stops remain authoring material rather than runtime persisted
identity.

Rejected: enumerating every generated palette stop by default, because raw
families are large, context-dependent, and unstable as end-user chart semantics.

### DEC-4 — Renderer lifecycle remains renderer-owned

**Reference:** `spec:AST-068/DEC-4`
**Decider:** pending owner review

A theme change updates an existing renderer through its supported props, options,
signals, redraw, uniforms, or buffers. Integrations own state preservation and
must declare a reset when live update is impossible.

Rejected: keying a chart by theme or mode, because remounting discards caller-
visible interaction and rendering state.

### DEC-5 — Core owns one renderer-free chart-color subpath

**Reference:** `spec:AST-068/DEC-5`
**Decider:** pending owner review

The stable persistence, projection, validation, and concrete resolution API lives
in a pure Core theme subpath beside its token identities. It does not re-export
through a client-only barrel and imports no React, StyleX value module, or chart
renderer.

Rejected: adding a chart-theme package for this small contract, because it would
add package and compatibility overhead without owning renderer behavior.

### DEC-6 — Initial custom colors are canonical opaque sRGB

**Reference:** `spec:AST-068/DEC-6`
**Decider:** pending owner review

The initial persisted custom grammar is uppercase `#RRGGBB`. Input normalization
is separate from persisted-input validation, and every renderer receives the same
rounded channels.

Rejected: alpha-bearing custom values in the initial contract, because every
surface and renderer would also need an explicit composition and contrast model.

## Open questions

- **OQ1 — Does a later advanced picker expose the complete generated palette?**
  (`human-design`)
  - The initial contract exposes only curated chart-safe identities.
  - A future advanced view requires stable palette and swatch IDs, projection
    versioning, contextual warnings, and migration rules before values may be
    persisted.
