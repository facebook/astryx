---
schema_version: 3
template_version: 3
kind: component
id: component:Selector
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-08-30
owners: [cixzhang, imdreamrunner]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Selector/Selector.test.tsx,
    packages/core/src/Selector/Selector.source-build.test.mjs,
    packages/core/src/Selector/__tests__/Selector.listbox.a11y.test.tsx,
    packages/core/src/Selector/__tests__/Listbox.a11y.chromium.spec.ts,
    apps/storybook/stories/Selector.stories.tsx,
    .github/scripts/story-play-guard.js,
  ]
modules: []
families: [family:input-fields]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:interaction-modality,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-004/DEC-1, spec:AST-011/DEC-1]
---

# Selector component contract

## Intent

Selector lets a person choose one value from a moderate list while keeping the
trigger usable as a form field or compact toolbar control. It owns single-value
selection, option navigation, search within the supplied options, and the
connection between the closed trigger and its selection surface.

## Compatibility and migration

- Released defaults and behavior remain unchanged by this record.
- `indicatorPosition` defaults to `end`; a rendered selection mark occupies
  space at that logical edge, while an empty resolved indicator occupies none.
- `presentation` defaults to `popover`. `bottom-sheet` is an explicit modal
  presentation, and `adaptive` selects it on compact coarse-pointer screens.
- `hasClear` changes the value contract to include `null`; that distinction is
  already part of the public type.
- `isReadOnly` is additive and defaults to `false`. It preserves the selected
  value, focus, and form participation while removing selection-surface and
  editing affordances. `isDisabled` takes precedence when both are set.
- `spec:AST-004/DEC-1` governs the state-derived indicator-space behavior in FR3.
- FR7 and DEC-1 record the shipped content-sized trigger block size; they change
  no default or rendered height.

## Ownership boundary

**Owns**

- Choosing one value from supplied options.
- Trigger, listbox, option, search, empty, loading, and disabled behavior.
- Keyboard navigation and announcements for that selection flow.
- Selector-specific composition of shared Field, Layer, adaptive presentation,
  and indicator behavior.
- The standalone trigger's content-sized block size (FR7), a deliberate
  difference from fixed-height input-family members that `family:input-fields`
  AV3 permits.

**Does not own / non-goals**

- Action or navigation menus; DropdownMenu owns those.
- Multi-value selection; MultiSelector owns it.
- Product-specific option content or filtering performed outside the supplied
  option list.
- Family-wide input state display, behavior, appearance, size, end-control,
  status-placement, and disabled-reason policy — owned by current
  `family:input-fields`.

## Public concepts

This table names semantic concepts reviewers need. Prop syntax, complete defaults,
and examples remain in `Selector.doc.mjs`.

| Concept                | Closed values or states                | Meaning                                                  | Availability by variant/orientation/state | Default   | Owner    | Stability | Invalid-value behavior          |
| ---------------------- | -------------------------------------- | -------------------------------------------------------- | ----------------------------------------- | --------- | -------- | --------- | ------------------------------- |
| trigger variant        | `input`, `ghost`                       | Form-field or toolbar presentation                       | All trigger states                        | `input`   | Selector | released  | TypeScript rejects other values |
| size                   | `sm`, `md`, `lg`                       | Trigger and option-row density                           | All presentations                         | `md`      | Selector | released  | TypeScript rejects other values |
| selected-mark position | `start`, `end`                         | Logical edge containing a rendered selection mark        | Every option row                          | `end`     | Selector | released  | TypeScript rejects other values |
| presentation           | `popover`, `bottom-sheet`, `adaptive`  | Anchored pointer surface or modal compact-touch surface  | All trigger variants                      | `popover` | Selector | released  | TypeScript rejects other values |
| popup semantics        | `listbox`; modal dialog containing one | Semantics follow the active presentation                 | Popover; bottom sheet                     | `listbox` | Selector | released  | No separate role prop is public |
| option-row state       | `selected`, `disabled`                 | Stable theming state on each option row                  | Every rendered option                     | neither   | Selector | released  | Unknown states are not emitted  |
| read-only state        | `false`, `true`                        | Preserves and submits value without selection affordance | Closed trigger                            | `false`   | Caller   | additive  | Boolean normalization           |

## Behavioral and layout contract

These requirements describe shipped behavior on current `main`.

| ID  | Shipped invariant                                                                                                                                                                                                                                                                                                                                                                                                        | Evidence                                                                 |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------ |
| FR1 | Selecting an enabled option updates the one selected value, closes the active presentation, and returns the trigger to its stable closed state.                                                                                                                                                                                                                                                                          | Consumer docs and selection interaction tests                            |
| FR2 | Without explicit placement, a non-search popover aligns the selected row over the trigger and clamps it to the viewport. Search popovers and explicit placement use normal Layer positioning.                                                                                                                                                                                                                            | Consumer docs, implementation, and geometry tests                        |
| FR3 | An option whose resolved selection indicator draws no content reserves no mark-column space. Visible selected or themed replacement indicators remain in layout at `indicatorPosition`; the resulting state-dependent label position or available width is intentional, and row content keeps its existing overflow behavior.                                                                                            | `itemMarkColumn`, focused indicator tests, and Chromium evidence stories |
| FR4 | `popover` uses an anchored Popover. `bottom-sheet` uses a modal BottomSheet. `adaptive` resolves to the modal bottom sheet on compact coarse-pointer screens and Popover otherwise.                                                                                                                                                                                                                                      | Presentation controller and adaptive-presentation tests                  |
| FR5 | While `isLoading` is true, the trigger exposes busy state and the listbox suppresses empty and no-results output.                                                                                                                                                                                                                                                                                                        | Loading, empty-state, and announcement tests                             |
| FR6 | While `isReadOnly` is true, the selected value remains focusable and form-submittable, while the selection surface, clear action, disclosure indicator, and every value-change path are unavailable.                                                                                                                                                                                                                     | Read-only interaction, form, and accessibility tests                     |
| FR7 | Outside an InputGroup, the trigger accommodates its rendered content instead of clipping it to the size token. A one-line value or placeholder measures the active `size` token whenever that token can contain it; when it cannot, the trigger grows to fit and may stand taller than same-size fixed-height controls. Further rendered lines, and custom `renderValue` content taller than one line, grow the trigger. | `SizeVariants` Chromium play test, stock geometry below, and DEC-1       |

**FR7 stock geometry (shipped evidence, not a requirement).** For the stock
bordered `input` trigger with value lines using its inherited row metrics, the
single-line row is the largest of `--spacing-5`, 20 CSS px, and `1rem`, and each
further line adds one row. The 20 CSS px and `1rem` terms are a conservative
stock-content baseline for 16px icons and the 20px clear control, not a minimum
every rendering needs. The token is met whenever it is at least the row plus two
border widths: 22 CSS px with default tokens. The `ghost` variant, component-level
theme overrides of Selector spacing, and custom `renderValue` content with its
own block size follow their own geometry.

**Known implementation gap — spacing-driven overshoot.** A one-line trigger
currently exceeds its token when `--spacing-5` plus borders is larger, even where
the displayed content can fit. The Playground's largest preset is one example:
its 40px small token, with a 40px `--spacing-5`, yields a 42px trigger. This
behavior is not an approved alignment exception; correcting it is outside this
record.

### Allowed variation

- **AV1 — Indicator rendering.** A theme may replace the check indicator. A
  replacement that draws in both selected and unselected states keeps its mark
  space in both states; only resolved empty output collapses.
- **AV2 — Option content.** `renderOption` may replace visible option content,
  while Selector keeps row role, selection, disabled state, navigation, and
  theming state.
- **AV3 — Selected value content.** `renderValue` may replace the closed value
  display without changing its combobox identity, whether editable or read-only.
- **AV4 — Below-floor refinement.** An implementation may let a trigger whose
  rendered content needs less than the FR7 stock row honor a smaller size token,
  such as a trigger without a clear control or one whose row is set by
  `--spacing-5`. It must not clip icons, the clear control, or value text to
  reach a token. Sub-pixel results at the floor may vary with resolved border
  width and browser rounding.

### Representative states

| State                    | Required invariant                                                                        | Allowed variation                                                 |
| ------------------------ | ----------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| closed with no value     | Label and placeholder identify the field                                                  | Consumer placeholder text                                         |
| closed with a value      | Selected option is represented in the trigger                                             | Custom `renderValue` content                                      |
| pointer / popover        | Anchored surface exposes the listbox without modal-dialog semantics                       | Default or explicit placement                                     |
| compact coarse pointer   | BottomSheet exposes a modal dialog containing the listbox                                 | Explicit `bottom-sheet` or resolved `adaptive`                    |
| searching                | Visible options, keyboard navigation, and announced result count use one filter           | Consumer search and empty text                                    |
| loading                  | Trigger is busy; empty and no-results output is suppressed                                | Consumer loading duration                                         |
| disabled with reason     | Trigger remains focusable enough to expose the reason while activation stays blocked      | Consumer reason text                                              |
| read-only                | Value stays focusable and submittable; menu, clear, and disclosure affordances are absent | Value rendering, status, and busy presentation                    |
| selected/unselected rows | Empty marks consume no width; visible marks retain space at the logical edge              | State-dependent label position/width and themed indicators        |
| one-line value, any size | Standalone trigger measures its size token when the token can contain its content         | Icon, clear, status, loading, read-only, or custom one-line value |
| multi-line value         | The standalone trigger grows to show every rendered line                                  | Caller `renderValue` content and row height                       |
| content above size token | Trigger grows to fit; icons, clear control, and text stay unclipped                       | Exact excess over the token depends on theme borders and rounding |

### Transformation and precedence order

- **ORD1 — Option normalization precedes filtering and selection.** Strings and
  option objects become one option shape before search, keyboard matching,
  rendering, and value comparison.
- **ORD2 — Caller-selected content wins deliberately.** `startIcon` takes
  precedence over a selected option's icon; explicit placement takes precedence
  over selected-item overlay alignment.

### Performance and resources

- **PR1 — Search does not add effect-driven result-count renders.** The next
  filtered count is derived from the input change and announced once for that
  query.
- **PR2 — Geometry work is scoped to the open popover.** Selected-item alignment
  may read browser layout while opening; it does not impose document-wide or
  persistent observation while closed.

## Accessibility contract

- **AR1 — Semantics follow presentation.** The anchored presentation exposes a
  listbox through a Popover and the trigger uses `aria-haspopup="listbox"`. The
  touch presentation exposes a modal BottomSheet dialog containing the listbox
  and the trigger uses `aria-haspopup="dialog"`.
- **AR2 — Focus follows the active interaction model.** The anchored presentation
  keeps the combobox relationship at the trigger/search control. The modal touch
  presentation moves focus into its search control or listbox and restores focus
  to the trigger when it closes.
- **AR3 — Keyboard selection matches the visible set.** Arrow, Home/End,
  typeahead, search, Enter, Escape, and Tab behavior operate on the options a
  person can currently perceive.
- **AR4 — Read-only semantics match availability.** A read-only value stays
  focusable, retains `role="combobox"`, and exposes `aria-readonly="true"` plus
  `aria-expanded="false"`. Its rendered content remains the combobox value. It
  does not expose `aria-controls`, `aria-activedescendant`, or an active selection
  surface. The implicit listbox popup describes the widget's selection capability;
  read-only state communicates that its value cannot currently change. Chromium's
  button-hosted combobox mapping omits the ARIA read-only property, so a localized
  accessible description also announces that state. Search and non-search modes
  use the same read-only combobox semantics because neither exposes a search
  control in this state.

## Design relationships

No current design spec is linked.

| Anatomy or state                 | Current representation requirement                                                                 | Representation authority   | Hierarchy role          | Component contract |
| -------------------------------- | -------------------------------------------------------------------------------------------------- | -------------------------- | ----------------------- | ------------------ |
| selected mark and option spacing | Empty resolved marks collapse; visible marks retain space, so row label geometry may vary by state | `spec:AST-004/DEC-1`       | supporting              | FR3                |
| input versus ghost trigger       | none recorded                                                                                      | existing released behavior | form or toolbar control | Public concepts    |

The first row implements the state-derived spacing decision in
`spec:AST-004/DEC-1`.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Field": {"delegatesTo": {"owner": "component:Field", "target": "field"}},
  "Trigger": {"target": "selector"},
  "Icon-rendered start icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Caller-rendered start content": {
    "none": {
      "reason": "intentional: Arbitrary ReactNode content is caller-owned and receives no Selector target."
    }
  },
  "Trigger clear button": {
    "delegatesTo": {
      "owner": "component:Field",
      "target": "input-clear-button"
    }
  },
  "Status icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Indicator icon": {"target": "selector-indicator-icon"},
  "Search row": {"target": "selector-search"},
  "Search icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Search clear button": {
    "delegatesTo": {
      "owner": "component:Field",
      "target": "input-clear-button"
    }
  },
  "Option row": {"target": "selector-option-row"},
  "SelectorOption-rendered content": {"target": "selector-option"},
  "Bare caller-rendered option content": {
    "none": {
      "reason": "intentional: Bare custom renderOption content is caller-owned and does not receive the SelectorOption target."
    }
  },
  "Option selection indicator": {"target": "selector-check"},
  "Option divider": {
    "delegatesTo": {"owner": "component:Divider", "target": "divider"}
  },
  "Section heading": {"target": "selector-section-heading"},
  "Empty state": {"target": "selector-empty-state"},
  "Pointer popup": {"target": "selector-popup"},
  "Touch sheet heading": {
    "delegatesTo": {"owner": "component:Text", "target": "heading"}
  },
  "Touch sheet": {
    "delegatesTo": {
      "owner": "component:BottomSheet",
      "target": "bottom-sheet"
    }
  }
}
```

`Field` is conditional: standalone Selector renders it, while InputGroup owns
that surrounding shell. `Pointer popup` and the two touch-sheet parts are
alternative presentations of the same panel content, not simultaneous anatomy.
Icon-rendered start content delegates to Icon; arbitrary `ReactNode` start content
is caller-owned. The default renderer and custom `renderOption` functions that
return `SelectorOption` retain its target; only bare caller-rendered option
content stays outside that target, while the targeted option row remains.
`selector-clear-icon` remains a deprecated compatibility alias and does not own a
current anatomy row.

This map records only shipped reachability. It does not treat the accepted,
unimplemented option-source behavior in `spec:AST-001` as current runtime behavior.
`spec:AST-004` governs FR3's shipped indicator-space behavior without adding a
new theming target.

## Family and system relationships

- The current architecture links in frontmatter own public API, theming, icon
  resolution, interaction modality, and Layer behavior used by Selector.
- `spec:AST-004/DEC-1` owns FR3's shipped indicator-space behavior.
- `spec:AST-011/DEC-1` owns the additive read-only state: caller-owned policy can
  preserve a focusable, submittable value without exposing selection controls.
- `family:input-fields` owns family-wide state display, behavior, appearance,
  size, end-control, disabled-reason, and status-placement policy. Selector
  keeps its `family:input-fields/DEC-1` standalone inline-size exception; this
  component contract owns selection behavior inside that boundary.
- Selector deliberately differs from the family's fixed-height members in block
  size, as `family:input-fields` AV3 permits. Same-size single-line controls
  align whenever the token can contain Selector's content; otherwise
  `component:Selector/DEC-1` keeps the trigger content-sized rather than
  clipping it to the token. InputGroup rows remain governed by family FR3.

## Verification map

| Contract              | Verification                                                                                                         | Representative states                                                                                                        | Mutation or failure expectation                                                                                                                                                                      | Audit section                    |
| --------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1, AR2, AR3         | `Selector.test.tsx` selection, focus, and keyboard suites                                                            | closed/open, search/non-search, disabled option                                                                              | Removing selection wiring, focus movement, or keyboard behavior fails the named interaction tests                                                                                                    | `audit:Selector/behavior`        |
| FR2                   | placement and selected-item geometry tests                                                                           | default, explicit, RTL, transformed entry                                                                                    | Using the wrong positioning model fails the expected position-area or margin                                                                                                                         | `audit:Selector/behavior`        |
| FR3, AV1              | Focused `Selector.test.tsx` computed-display checks plus guarded Chromium Storybook matrix and stable visual stories | popover/bottom sheet, narrow/wide, start/end, LTR/RTL, selected/unselected, check/radio                                      | Empty output reserves width, visible output collapses, logical placement flips incorrectly, or row content overflows                                                                                 | `audit:Selector/design-rendered` |
| FR4, AR1, AR2         | presentation tests plus `aria-haspopup` source review                                                                | pointer, compact coarse pointer, search/non-search                                                                           | Wrong Popover/dialog roles or focus destinations fail tests; `aria-haspopup` values require source/a11y review                                                                                       | `audit:Selector/accessibility`   |
| AR1, AV2              | `Selector.listbox.a11y.test.tsx` and `Listbox.a11y.chromium.spec.ts` against the shared Listbox contract             | popover/sheet, flat/grouped, selected/unselected, disabled, search, loading, custom RTL                                      | A new or wider loss of role, listbox/option name, state, or ownership gates; the exact unnamed no-search sheet state remains known debt                                                              | `audit:Selector/accessibility`   |
| FR5                   | loading, empty-state, and live-region tests                                                                          | empty options, unmatched search, loading                                                                                     | Empty/no-results output appears or is announced while loading                                                                                                                                        | `audit:Selector/behavior`        |
| FR6, AR4              | read-only interaction, form, ARIA, and theme-state tests                                                             | search/non-search, clearable, open→read-only, disabled precedence                                                            | A value changes, popup or edit affordance remains, form value disappears, or read-only semantics are absent                                                                                          | `audit:Selector/accessibility`   |
| FR7, AV4              | `SizeVariants` Chromium play test in `Selector.stories.tsx`, listed in `story-play-guard.js`                         | three default placeholders; nine compact (`--spacing-5: 10px`) one-line states at each size; three compact multi-line values | A one-line trigger misses its token, or a multi-line value does not grow. Multi-line cases verify growth only; exact row increments, below-floor geometry, and AV4 refinements are not covered (OQ1) | `audit:Selector/design-rendered` |
| source-build contract | `Selector.source-build.test.mjs`                                                                                     | package source compiled by consumer Babel                                                                                    | Moving evaluated StyleX values outside the supported source form fails compilation                                                                                                                   | `audit:Selector/code-health`     |

## Decision log

FR3 implements the system decision owned by `spec:AST-004/DEC-1`.

### DEC-1 — The trigger is content-sized and never clipped to its token

**Reference:** `component:Selector/DEC-1`
**Decider:** imdreamrunner, 2026-09-30

The closed trigger can render multi-line values through `renderValue`, so its
block size follows its content instead of a fixed height: a one-line value
measures the size token, and further lines grow the trigger. When a theme sets a
size token too small for the trigger's single-line content and borders, the
trigger grows to fit (FR7) and may stand taller than same-size fixed-height
controls, rather than clipping icons, the clear control, or text to the token.

This decision covers content accommodation only. It does not make the
`--spacing-5` row term a reason for a one-line trigger to exceed a token its
content fits in; that overshoot is the known implementation gap recorded under
FR7, and AV4 permits an implementation that honors such a token.

Rejected: an unconditional fixed trigger height equal to the token, as
MultiSelector and Button use. It honors any token but clips or overflows
multi-line values and any single-line content taller than the token.

## Open questions

- **OQ1 — Below-floor fixture** (`checkable`). `SizeVariants` has no theme whose
  size token is below the stock floor, and its multi-line cases do not assert
  row increments. A fixture should assert that a below-floor trigger grows to
  fit with its clear control and icons unclipped.

## Content boundary

This file does not copy the full prop reference, examples, current audit score,
family proposals, or future implementation steps. Those remain with their
existing owners.
