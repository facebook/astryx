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

# Chart color choices and renderer handoff system spec

## Intent

Use this contract when a product lets people override the colors in an editable
chart. Automatic gives them a way to remove a manual choice and return that
series to the chart's default behavior.

### Use cases

- Dashboard and report builders where people can change individual series
  colors.
- Spreadsheet-style chart editors with a color picker and a Reset action.
- Reusable chart templates where a person can override a default and later
  restore it.
- Saved charts that may be shown through SVG, Canvas, serialized configuration,
  or GPU renderers.

A static chart with no end-user color control does not need Automatic or the
saved-choice API.

An editable chart can offer three color behaviors:

| Choice                            | What is saved          | What happens when the theme changes                  |
| --------------------------------- | ---------------------- | ---------------------------------------------------- |
| **Automatic (use chart default)** | Nothing                | The chart picks again from the active theme's colors |
| **Theme color**                   | An Astryx theme color  | The selected color follows the new theme             |
| **Custom color**                  | The exact custom color | The selected color does not change                   |

For example, a chart may give Revenue the first color in its palette and Costs
the second. In Automatic mode, that is all that happens—there is no saved color
choice for either series. When the theme changes, the chart uses the first and
second colors from the new theme.

If someone manually changes Revenue to purple, purple is saved. Reset deletes
purple, and the chart goes back to choosing Revenue's color by its default rule.

The product owns that default rule. This contract does not promise that an
Automatic color stays on the same series after reordering or filtering. A
product that needs that behavior must keep its own stable series-to-color
mapping.

A chart renderer receives the same choice in the format it can safely use. A
live SVG or DOM property may use a CSS token reference. Canvas, configuration
objects, workers, server rendering, and exports receive a concrete color. GPU
renderers receive normalized numeric channels.

The shared contract covers color choice, validation, picker options, and color
resolution. It does not try to hide the differences between Recharts, Vega,
Canvas, WebGL, or other renderers.

## Non-goals

- Provide one universal chart component or one configuration object that works
  with every chart library.
- Promise support for every third-party chart library or release.
- Provide a complete chart data, interaction, tooltip, legend, or accessibility
  implementation for a product.
- Offer every raw generated palette value in the default end-user picker.
- Add a second theme system or change the data-token ownership defined by
  `spec:AST-066`.
- Standardize gradients, patterns, images, blend modes, or renderer runtime
  objects in this solid-color contract.
- Require one internal implementation when another implementation produces the
  same public behavior.

## Requirements

### Saved color choices

- **FR1 — Automatic means use the chart default.** An Automatic series has no
  saved color choice. The chart chooses a color with the product's default rule.
  Reset deletes a saved theme or custom choice and returns to that default.

  The product owns the default rule. If it needs one series to keep the same
  default color after reordering or filtering, it stores that mapping separately
  from the person's color choice.

  **Why:** saving the chart's current default as though the person selected it
  would stop the color from following future theme changes.

- **FR2 — A saved override has one of two exact shapes.** A theme choice stores
  only a supported chart-color token identity:

  ```json
  {"kind": "theme", "token": "--color-data-categorical-blue"}
  ```

  A custom choice stores only one canonical, opaque, uppercase `#RRGGBB` value:

  ```json
  {"kind": "custom", "color": "#AABBCC"}
  ```

  A theme choice does not store its current resolved color, and a custom choice
  does not modify the active theme.

  User input may be normalized before it is saved. Reading saved data is strict:
  lowercase colors, extra fields, and unsupported shapes are rejected rather
  than silently rewritten.

  **Why:** token identity lets a theme choice follow theme and mode changes. A
  small custom-color grammar gives every renderer the same portable value and
  avoids undefined alpha-compositing behavior.

- **FR3 — Saved choices do not contain renderer configuration.** Persistence
  does not include CSS variable strings, Recharts props, Vega signals, Canvas
  objects, GPU arrays, callbacks, or another renderer's options. The integration
  derives those values when it renders.

  **Why:** a chart document should remain usable if the product changes its
  renderer or renders the same chart in more than one place.

### Picker options and theme palettes

- **FR4 — Listing, validating, and resolving choices are separate actions.** A
  picker lists the choices currently offered. Validation checks whether a saved
  choice is supported. Resolution converts a valid choice for an explicit theme
  and mode.

  Removing a token from the picker does not invalidate an existing saved choice
  while that token remains supported. Renaming or removing a supported saved
  token requires an API compatibility review and a data migration.

  **Why:** products need to change a picker's layout or reduce its options
  without corrupting charts that already use a valid token.

- **FR5 — The default picker uses a curated set of stable chart tokens.** The
  default list is the ten canonical categorical data tokens in a documented
  order. Each option has a stable machine ID and a preview resolved from the
  active theme. Products provide the visible label, accessible name, grouping,
  search terms, and picker layout.

  A theme may map values from its generated palette into those chart tokens when
  the theme is authored. The runtime picker does not expose every raw palette
  stop or generate a new palette from an accent color.

  **Why:** generated palette stops are authoring inputs and may change as a
  theme evolves. Stable chart-token identities keep saved choices meaningful,
  while a curated list keeps the default picker manageable.

### Validation and failure behavior

- **FR6 — Invalid input fails visibly and safely.** Validation returns a
  structured diagnostic for an unknown choice type, unsupported token, malformed
  custom color, or unexpected saved field. Resolution also returns a diagnostic
  when the active theme value cannot become a supported concrete color.

  If the product must keep rendering, it returns to Automatic and reports the
  diagnostic through its existing error path. It does not guess a similar token
  or keep an old resolved color.

  **Why:** guessing can display a different color than the person selected and
  can hide a migration or theme-authoring problem.

### Giving colors to a renderer

- **FR7 — The output format follows the point where the color is consumed.**

  | Consumption point                                                                                                                                      | Value to use                                                |
  | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------- |
  | Theme choice sent directly to a verified live DOM or SVG paint property                                                                                | The matching public `dataVars` reference                    |
  | Custom choice on live paint, or any choice used by JavaScript options, color calculations, Canvas, serialization, workers, server rendering, or export | Canonical opaque sRGB                                       |
  | GPU uniform or buffer                                                                                                                                  | `rgba01`: four channels in the `0..1` range, with alpha `1` |
  | Gradient, pattern, image, or renderer runtime object                                                                                                   | An object created and owned by that renderer integration    |

  A CSS reference is appropriate only when the value reaches live paint without
  JavaScript parsing or color calculations. That path also depends on the
  layered StyleX integration owned by `spec:AST-066`; an unlayered pipeline is
  outside the theme-override guarantee. The renderer-free resolver does not
  construct CSS-variable strings.

  **Why:** these consumers accept different value types. A CSS variable may
  paint correctly in SVG but cannot safely be serialized, parsed as a concrete
  color, or sent directly to a GPU.

- **FR8 — Concrete resolution is explicit about its environment.** React callers
  use the token resolver from the nearest supported `useTheme()` context. A host
  resolves the bounded concrete values needed by a worker and sends those values
  with a theme revision or equivalent change marker. Servers, tests, and exports
  provide a resolver for an explicit theme and effective light or dark mode.

  Concrete resolution does not read browser computed styles. It therefore does
  not automatically observe arbitrary descendant CSS, `MediaTheme`, or every
  on-surface adaptation. An integration that must match one of those surfaces
  supplies an explicit mapping for that surface.

  **Why:** workers and detached environments have no reliable document cascade.
  Pretending that a JavaScript resolver sees every scoped CSS override can make
  a chart disagree with its surrounding surface.

### Renderer updates

- **FR9 — Theme changes preserve renderer state when the renderer allows it.**
  An integration updates existing props, options, drawing state, signals,
  uniforms, or buffers and requests the renderer's normal redraw. It does not
  remount a chart only because the theme or mode changed.

  If a renderer cannot apply the change in place, the integration either restores
  the supported state after rebuilding or documents the state that resets. It
  does not describe that path as seamless switching.

  **Why:** rebuilding can discard focus, selection, zoom, hover, tooltips,
  animation progress, and renderer resources.

### Accessibility boundary

- **FR10 — The chart-color API does not guarantee that a chart is accessible.**
  It returns color values and validation diagnostics. It does not label a color
  or a finished chart as accessible.

  The product and renderer integration own contrast on the actual background,
  non-color cues, labels, keyboard and touch access, and readable data
  alternatives.

  **Why:** the same color can be readable in one chart and unreadable in another.
  Accessibility depends on the final chart, not the color value by itself.

### Packaging and documentation

- **FR11 — The shared color contract stays renderer-neutral.** The stable owner
  is `@astryxdesign/core/theme/chartColors`. It does not depend on React, StyleX
  value modules, or a chart renderer.

  Public docs explain the supported handoff boundaries and use Recharts, Canvas,
  Vega, and WebGL as examples. An example is not a promise that Astryx maintains
  a universal adapter or every future version of that library. A renderer
  integration that makes a compatibility promise owns and tests that promise.

  **Why:** a small shared contract is useful across renderers. Pulling renderer
  dependencies into Core would couple unrelated products and turn examples into
  compatibility obligations.

### Platform support

- Supported floor: the existing Astryx Theme, StyleX, and token-resolver support
  matrix.
- Unsupported path: when a renderer cannot consume one of the documented output
  formats, its integration adapts the value through a documented local step or
  reports that the path is unsupported. It does not rely on accidental fallback
  paint.
- Browser evidence: direct SVG paint, Canvas redraw, and GPU updates require
  real-browser evidence. Worker transport and serialization require detached-
  data evidence.

## Current-state impact

`spec:AST-066` owns the canonical data-token names, values, StyleX variables,
theme overrides, and token-resolution behavior. This record defines a chart-
specific contract on top of that token system; it does not rename or move the
tokens.

Ownership is divided as follows:

| Owner                    | Responsibility                                                                                                       |
| ------------------------ | -------------------------------------------------------------------------------------------------------------------- |
| Core chart-color subpath | Supported chart-token IDs, saved choice shapes, picker projection, validation, and concrete color outputs            |
| Product                  | Automatic behavior, localized picker UI, document storage, diagnostic presentation, and contextual accessibility     |
| Renderer integration     | Library syntax, redraw or rebuild behavior, state preservation, runtime paint objects, and any compatibility promise |
| Consumer docs            | Supported handoff patterns, limits, and worked examples                                                              |

Generated palettes remain theme-authoring inputs. A theme exposes selected
values to charts by assigning them to the stable data tokens owned by
`spec:AST-066`.

## Verification

| Contract  | Verification                                                       | Representative states                                                                                            | The check must fail when                                                                                                |
| --------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| FR1–FR3   | Choice-shape, normalization, saved-data, and JSON round-trip tests | absent override, theme choice, custom choice, Reset                                                              | Automatic or renderer data is saved, lowercase persisted input is accepted, or a resolved color replaces token identity |
| FR4–FR6   | Inventory, projection, validation, and resolution tests            | default list, product subset, theme preview changes, malformed input, unsupported resolved value                 | picker membership becomes validation, IDs drift, invalid input is guessed, or resolution failure is hidden              |
| FR7–FR8   | Format and renderer-boundary tests                                 | direct CSS theme choice, concrete custom choice, sRGB, `rgba01`, explicit theme and mode, bounded worker payload | a CSS reference reaches Canvas, serialization, worker, or GPU code; custom live paint is treated as `dataVars`          |
| FR9       | Real-renderer lifecycle evidence                                   | in-place SVG, Canvas, and GPU updates; disclosed rebuild and state reset                                         | a theme change silently remounts stateful output or claims seamless switching after state loss                          |
| FR10–FR11 | API, package-boundary, and docs checks                             | accessibility ownership, renderer examples                                                                       | the API certifies a color or chart as accessible, Core gains a renderer dependency, or docs promise universal support   |

## Decision log

### DEC-1 — Chart overrides do not edit the theme

**Reference:** `spec:AST-068/DEC-1`
**Decider:** `rubyycheung`, `2026-10-07`

Automatic, theme-aware, and custom choices belong to the chart document. This
keeps one chart edit from changing unrelated charts or components.

Rejected: applying an end-user chart color as a global theme override, because
the change would affect unrelated content.

### DEC-2 — The consumption point selects the color format

**Reference:** `spec:AST-068/DEC-2`
**Decider:** pending owner review

The contract provides a direct-CSS path, a concrete sRGB path, and a normalized
GPU path because those consumers require different value types.

Rejected: one color string for every renderer, because some paths parse,
serialize, calculate with, or numerically upload the value.

### DEC-3 — Generated palettes map into stable chart tokens

**Reference:** `spec:AST-068/DEC-3`
**Decider:** pending owner review

A theme author maps selected generated values to stable chart tokens. The picker
shows those tokens and their current previews, so saved choices survive palette
regeneration.

Rejected: saving raw generated palette stops, because their names and positions
are authoring details rather than stable chart meaning.

### DEC-4 — Renderer integrations own update and rebuild behavior

**Reference:** `spec:AST-068/DEC-4`
**Decider:** pending owner review

An integration uses its renderer's supported update path and discloses state
loss when rebuilding is unavoidable.

Rejected: remounting every chart on a theme change, because remounting can lose
interaction state and renderer resources.

### DEC-5 — Core owns one small renderer-neutral subpath

**Reference:** `spec:AST-068/DEC-5`
**Decider:** pending owner review

The shared API lives in one focused Core subpath and imports no renderer. This
keeps the contract reusable without creating a renderer package dependency.

Rejected: a new chart-theme package for this contract, because it would add a
package boundary without owning renderer behavior.

### DEC-6 — Custom colors use opaque sRGB

**Reference:** `spec:AST-068/DEC-6`
**Decider:** pending owner review

Custom input is normalized before saving, and the stored form is uppercase
`#RRGGBB`. This gives every renderer one unambiguous portable value.

Rejected: alpha-bearing custom colors, because they also require a shared
compositing and contrast model.

## Open questions

None.
