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
- `indicatorPosition` defaults to `end`; every option row currently reserves the
  indicator column at the configured logical edge.
- `presentation` defaults to `popover`. `bottom-sheet` is an explicit modal
  presentation, and `adaptive` selects it on compact coarse-pointer screens.
- `hasClear` changes the value contract to include `null`; that distinction is
  already part of the public type.
- `isReadOnly` is additive and defaults to `false`. It preserves the selected
  value, focus, and form participation while removing selection-surface and
  editing affordances. `isDisabled` takes precedence when both are set.
- `triggerIndicator` is additive and defaults to `chevron`. `none` removes only
  the editable trigger's disclosure chevron; interaction and accessibility
  behavior remain unchanged.
- `spec:AST-004/DEC-1` accepts a future change that collapses an empty indicator
  column. It is not shipped behavior and does not replace FR3 until implementation,
  visual verification, and an update to this current contract land together.

## Ownership boundary

**Owns**

- Choosing one value from supplied options.
- Trigger, listbox, option, search, empty, loading, and disabled behavior.
- Keyboard navigation and announcements for that selection flow.
- Selector-specific composition of shared Field, Layer, adaptive presentation,
  and indicator behavior.

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
| selected-mark position | `start`, `end`                         | Logical edge containing the reserved selection column    | Every option row                          | `end`     | Selector | released  | TypeScript rejects other values |
| presentation           | `popover`, `bottom-sheet`, `adaptive`  | Anchored pointer surface or modal compact-touch surface  | All trigger variants                      | `popover` | Selector | released  | TypeScript rejects other values |
| popup semantics        | `listbox`; modal dialog containing one | Semantics follow the active presentation                 | Popover; bottom sheet                     | `listbox` | Selector | released  | No separate role prop is public |
| option-row state       | `selected`, `disabled`                 | Stable theming state on each option row                  | Every rendered option                     | neither   | Selector | released  | Unknown states are not emitted  |
| read-only state        | `false`, `true`                        | Preserves and submits value without selection affordance | Closed trigger                            | `false`   | Caller   | additive  | Boolean normalization           |
| trigger indicator      | `chevron`, `none`                      | Shows or omits the editable trigger's disclosure chevron | Editable closed trigger                   | `chevron` | Caller   | additive  | TypeScript rejects other values |

## Behavioral and layout contract

These requirements describe shipped behavior on current `main`.

| ID  | Shipped invariant                                                                                                                                                                                                 | Evidence                                                    |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| FR1 | Selecting an enabled option updates the one selected value, closes the active presentation, and returns the trigger to its stable closed state.                                                                   | Consumer docs and selection interaction tests               |
| FR2 | Without explicit placement, a non-search popover aligns the selected row over the trigger and clamps it to the viewport. Search popovers and explicit placement use normal Layer positioning.                     | Consumer docs, implementation, and geometry tests           |
| FR3 | Every option row reserves one selection-mark column at `indicatorPosition`, even when the default unchecked indicator draws nothing. The column has a minimum width and can grow for a larger themed replacement. | `itemMarkColumn`, indicator-position tests, and theme tests |
| FR4 | `popover` uses an anchored Popover. `bottom-sheet` uses a modal BottomSheet. `adaptive` resolves to the modal bottom sheet on compact coarse-pointer screens and Popover otherwise.                               | Presentation controller and adaptive-presentation tests     |
| FR5 | While `isLoading` is true, the trigger exposes busy state and the listbox suppresses empty and no-results output.                                                                                                 | Loading, empty-state, and announcement tests                |
| FR6 | While `isReadOnly` is true, the selected value remains focusable and form-submittable, while the selection surface, clear action, disclosure indicator, and every value-change path are unavailable.              | Read-only interaction, form, and accessibility tests        |
| FR7 | `triggerIndicator="none"` omits the editable trigger's disclosure chevron without changing popup semantics, keyboard behavior, selection, clear actions, or status icons.                                         | Trigger-indicator interaction and status tests              |

### Allowed variation

- **AV1 — Indicator rendering.** A theme may replace the check indicator. The
  replacement may draw in both selected and unselected states; the current row
  still reserves its indicator column.
- **AV2 — Option content.** `renderOption` may replace visible option content,
  while Selector keeps row role, selection, disabled state, navigation, and
  theming state.
- **AV3 — Selected value content.** `renderValue` may replace the closed value
  display without changing its combobox identity, whether editable or read-only.

### Representative states

| State                    | Required invariant                                                                        | Allowed variation                                      |
| ------------------------ | ----------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| closed with no value     | Label and placeholder identify the field                                                  | Consumer placeholder text                              |
| closed with a value      | Selected option is represented in the trigger                                             | Custom `renderValue` content                           |
| pointer / popover        | Anchored surface exposes the listbox without modal-dialog semantics                       | Default or explicit placement                          |
| compact coarse pointer   | BottomSheet exposes a modal dialog containing the listbox                                 | Explicit `bottom-sheet` or resolved `adaptive`         |
| searching                | Visible options, keyboard navigation, and announced result count use one filter           | Consumer search and empty text                         |
| loading                  | Trigger is busy; empty and no-results output is suppressed                                | Consumer loading duration                              |
| disabled with reason     | Trigger remains focusable enough to expose the reason while activation stays blocked      | Consumer reason text                                   |
| read-only                | Value stays focusable and submittable; menu, clear, and disclosure affordances are absent | Value rendering, status, and busy presentation         |
| editable without chevron | Trigger remains focusable and editable with unchanged popup and keyboard semantics        | Consumer context supplies sufficient disclosure        |
| selected/unselected rows | Row semantics and theming state are correct; both reserve the indicator column            | Start/end position and themed indicator representation |

### Transformation and precedence order

- **ORD1 — Option normalization precedes filtering and selection.** Strings and
  option objects become one option shape before search, keyboard matching,
  rendering, and value comparison.
- **ORD2 — Caller-selected content wins deliberately.** `startIcon` takes
  precedence over a selected option's icon; explicit placement takes precedence
  over selected-item overlay alignment.
- **ORD3 — Status remains visible.** Attached and tooltip status icons retain
  their trailing slot when `triggerIndicator="none"`; read-only state still
  removes ordinary disclosure affordances.

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

| Anatomy or state                 | Current representation requirement                                                      | Representation authority   | Hierarchy role          | Component contract |
| -------------------------------- | --------------------------------------------------------------------------------------- | -------------------------- | ----------------------- | ------------------ |
| selected mark and option spacing | Every row reserves the indicator column, preserving label alignment and available width | existing shipped behavior  | supporting              | FR3                |
| input versus ghost trigger       | none recorded                                                                           | existing released behavior | form or toolbar control | Public concepts    |

The approved but unimplemented replacement for the first row is owned by
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
unimplemented option-source behavior in `spec:AST-001` or indicator-space change
in `spec:AST-004` as current runtime behavior.

## Family and system relationships

- The current architecture links in frontmatter own public API, theming, icon
  resolution, interaction modality, and Layer behavior used by Selector.
- `spec:AST-004/DEC-1` owns the accepted future indicator-space change. Its
  `accepted` phase is direction for implementation, not evidence that the runtime
  has changed.
- `spec:AST-011/DEC-1` owns the additive read-only state: caller-owned policy can
  preserve a focusable, submittable value without exposing selection controls.
- `family:input-fields` owns family-wide state display, behavior, appearance,
  size, end-control, disabled-reason, and status-placement policy. Selector
  keeps its DEC-1 standalone inline-size exception; this component contract
  owns selection behavior inside that boundary.

## Verification map

| Contract              | Verification                                                                               | Representative states                                             | Mutation or failure expectation                                                                                | Audit section                    |
| --------------------- | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1, AR2, AR3         | `Selector.test.tsx` selection, focus, and keyboard suites                                  | closed/open, search/non-search, disabled option                   | Removing selection wiring, focus movement, or keyboard behavior fails the named interaction tests              | `audit:Selector/behavior`        |
| FR2                   | placement and selected-item geometry tests                                                 | default, explicit, RTL, transformed entry                         | Using the wrong positioning model fails the expected position-area or margin                                   | `audit:Selector/behavior`        |
| FR3, AV1              | `itemMarkColumn` source inspection plus indicator-position and replacement-indicator tests | start/end, selected/unselected, check/radio                       | Removing the wrapper fails row-structure tests; changing its reserved width requires source/layout review      | `audit:Selector/design-rendered` |
| FR4, AR1, AR2         | presentation tests plus `aria-haspopup` source review                                      | pointer, compact coarse pointer, search/non-search                | Wrong Popover/dialog roles or focus destinations fail tests; `aria-haspopup` values require source/a11y review | `audit:Selector/accessibility`   |
| FR5                   | loading, empty-state, and live-region tests                                                | empty options, unmatched search, loading                          | Empty/no-results output appears or is announced while loading                                                  | `audit:Selector/behavior`        |
| FR6, AR4              | read-only interaction, form, ARIA, and theme-state tests                                   | search/non-search, clearable, open→read-only, disabled precedence | A value changes, popup or edit affordance remains, form value disappears, or read-only semantics are absent    | `audit:Selector/accessibility`   |
| FR7                   | trigger-indicator interaction and status tests                                             | default chevron, omitted chevron, status                          | Omission changes keyboard/popup semantics or suppresses status feedback                                        | `audit:Selector/behavior`        |
| source-build contract | `Selector.source-build.test.mjs`                                                           | package source compiled by consumer Babel                         | Moving evaluated StyleX values outside the supported source form fails compilation                             | `audit:Selector/code-health`     |

## Decision log

No component-local future decision is recorded here. Accepted unimplemented work
is owned by `spec:AST-004`.

## Open questions

None.

## Content boundary

This file does not copy the full prop reference, examples, current audit score,
family proposals, or future implementation steps. Those remain with their
existing owners.
