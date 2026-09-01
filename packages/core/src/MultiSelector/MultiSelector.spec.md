---
schema_version: 1
template_version: 3
kind: component
id: component:MultiSelector
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/MultiSelector/MultiSelector.test.tsx,
    packages/core/src/BottomSheet/BottomSheet.test.tsx,
    packages/core/src/CheckboxInput/CheckboxInput.test.tsx,
    packages/core/src/Divider/Divider.test.tsx,
    packages/core/src/Field/Field.test.tsx,
    packages/core/src/Icon/Icon.test.tsx,
    packages/core/src/Text/Text.test.tsx,
    scripts/check-knowledge.mjs,
  ]
families: [family:overlay-dismissal]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-006/DEC-1]
---

# MultiSelector component contract

## Intent

MultiSelector renders a multi-selection control with an optional standalone Field
shell and one shared panel content tree in either an anchored pointer popup or a
touch-oriented BottomSheet. It also supports a read-only state that preserves and
submits the selected values without exposing that panel or an editing affordance.
This draft records current consumer anatomy, theming ownership, and read-only
behavior.

## Compatibility and migration

- Released default preserved: `yes`
- `isReadOnly` is additive and defaults to `false`. It preserves selected values,
  focus, and form participation while removing selection-surface and editing
  affordances. `isDisabled` takes precedence when both are set.
- Existing DOM, styling, targets, and public API remain unchanged when the prop is
  omitted.
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted Trigger and its current `multi-selector` target.
- Indicator icon, Search row, Option row, Section heading, Empty state, and
  Pointer popup presentation through the other six current MultiSelector targets.
- One shared panel-content tree containing optional search, option, divider,
  section, and empty-state content regardless of which presentation hosts it.

**Does not own / non-goals**

- Standalone field-shell presentation — rendered by Field and themed through
  Field's current `field` target; omitted when MultiSelector is inside InputGroup.
- Shared clear actions — rendered by Field's InputClearButton and themed through
  Field's current `input-clear-button` target.
- Option checkbox presentation — rendered by CheckboxInput and themed through
  CheckboxInput's current `checkbox-indicator` target.
- Public option dividers — rendered by Divider and themed through Divider's
  current `divider` target.
- General Icon presentation for start, search, and status icons — rendered by
  Icon and themed through Icon's current `icon` target.
- The Touch sheet heading — rendered by Heading and themed through Text's current
  `heading` target.
- The Touch sheet panel — rendered by BottomSheet and themed through
  BottomSheet's current `bottom-sheet` target.
- Arbitrary ReactNode start content supplied by the caller.
- Shared layer lifecycle, positioning, and dismissal behavior.

## Public concepts

This table names the additive concept introduced by `spec:AST-006`. Complete prop
syntax and examples remain in `MultiSelector.doc.mjs`.

| Concept         | Closed values or states | Meaning                                                   | Availability   | Default | Owner  | Stability | Invalid-value behavior |
| --------------- | ----------------------- | --------------------------------------------------------- | -------------- | ------- | ------ | --------- | ---------------------- |
| read-only state | `false`, `true`         | Preserves and submits values without selection affordance | Closed trigger | `false` | Caller | additive  | Boolean normalization  |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                           | Basis                           | Draft review state                                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | -------------------------------------------------- |
| FR1 | The current standalone presentation contains a Field and painted Trigger; the supported InputGroup path renders the same Trigger without a Field. Optional start content, clear action, status icon, or Indicator icon follows supplied props and state.                      | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR2 | The shared panel content contains the optional Search row, zero or more Option rows, optional public Option dividers and Section headings, and an Empty state when the applicable result set is empty and the value is not loading.                                           | Current source, docs, and tests | Verified current behavior; no new behavior decided |
| FR3 | Trigger, Indicator icon, Search row, Option row, Section heading, Empty state, and Pointer popup carry the seven current non-deprecated MultiSelector targets documented in `MultiSelector.doc.mjs`.                                                                          | Current source, docs, and tests | Verified current behavior; no target change        |
| FR4 | When present, Field, shared clear actions, option checkbox indicators, public Option dividers, general icons, Touch sheet heading, and Touch sheet retain their Field, CheckboxInput, Divider, Icon, Text, and BottomSheet theming owners.                                    | Current composition and owners  | Verified current behavior; no target change        |
| FR5 | Pointer popup and Touch sheet are separate surface anatomy rows, but both host the same `panelContent` tree; the Touch sheet additionally renders its Heading. Changing presentation does not create a second search, option, divider, section, or empty-state content model. | Current source and tests        | Verified current behavior; no normalization        |
| FR6 | `multi-selector-clear-icon` remains a deprecated compatibility alias for `input-clear-icon`; it is not a current target and does not claim a separate anatomy part.                                                                                                           | Current public target metadata  | Verified current compatibility state               |
| FR7 | While `isReadOnly` is true, selected values remain focusable and form-submittable, while the selection surface, clear action, disclosure indicator, and every value-change path are unavailable.                                                                              | `spec:AST-006`, docs, and tests | Accepted read-only behavior                        |

### Allowed variation

- Standalone MultiSelector renders Field; the supported InputGroup path omits it.
- `presentation="popover"` uses the Pointer popup; `presentation="bottom-sheet"`
  uses the Touch sheet and its Heading; `presentation="adaptive"` selects between
  those existing branches from current modality and viewport behavior.
- Search row, Option divider, Section heading, Empty state, select-all Option row,
  and both clear actions are optional under their documented prop and data conditions.
- Semantic names and icon component types render through Icon. Arbitrary ReactNode
  start content renders directly and stays caller-owned.
- Trigger text, labels, badges, and custom option content may vary inside the
  Trigger or Option row without creating another MultiSelector target.

### Representative states

| State                                  | Required invariant                                                                                          | Allowed variation                                                        |
| -------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| Standalone or InputGroup               | Field is present only standalone; Trigger anatomy and targets remain the same in both paths.                | InputGroup owns grouped layout and labeling support.                     |
| Pointer presentation                   | Pointer popup carries `multi-selector-popup` and hosts the shared panel content.                            | Search, groups, options, and empty content follow their ordinary states. |
| Touch presentation                     | BottomSheet owns the Sheet panel, Text owns its Heading, and the sheet hosts the same shared panel content. | Adaptive or explicit selection may choose this branch.                   |
| Search enabled with a query            | Search row owns `multi-selector-search`; its icons/actions keep their shared owners.                        | Results may be flat, grouped, or empty.                                  |
| Option, select all, selected, disabled | Option row owns `multi-selector-option` and reflects its current size/state metadata.                       | Checkbox state and custom row content vary independently.                |
| Attached or tooltip status             | Status icon replaces the Indicator icon.                                                                    | Tooltip status wraps the icon in a button without changing Icon owner.   |
| Read-only                              | Values stay focusable and submittable; panel, clear, and disclosure affordances are absent.                 | Trigger display, status, and busy presentation remain available.         |

### Transformation and precedence order

- No new search, selection, presentation, or styling precedence rule is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

Existing field, combobox, listbox, checkbox, live-region, focus, and dismissal
behavior remains unchanged when editable. A read-only trigger stays focusable,
exposes `aria-readonly="true"`, remains collapsed, and does not claim or render an
active selection surface. In search mode the trigger itself owns the read-only
combobox role because no search input is available.

## Design relationships

| Anatomy or state              | Design requirement                                                                                | Representation authority       | Hierarchy role    | Component contract |
| ----------------------------- | ------------------------------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Field                         | Provides the label and optional supporting content outside InputGroup; omitted inside InputGroup. | Field component                | Supporting        | FR1, FR4           |
| Trigger                       | Presents the current selection or placeholder and opens the active presentation.                  | Current source and public docs | Prominent         | FR1, FR3           |
| Icon-rendered start icon      | Presents a semantic or component icon through Icon.                                               | Icon component                 | Supporting        | FR1, FR4           |
| Caller-rendered start content | Presents arbitrary caller content directly in the trigger's start slot.                           | Caller-supplied content        | Context-dependent | FR1                |
| Trigger clear button          | Removes every selected value through the shared field clear action.                               | Field component                | Supporting        | FR1, FR4           |
| Status icon                   | Presents attached or tooltip validation state through Icon.                                       | Icon component                 | Supporting        | FR1, FR4           |
| Indicator icon                | Presents disclosure state when status presentation does not replace it.                           | Current source and public docs | Supporting        | FR1, FR3           |
| Search row                    | Provides query entry at the top of the shared panel content.                                      | Current source and public docs | Supporting        | FR2, FR3, FR5      |
| Search icon                   | Presents the search affordance through Icon.                                                      | Icon component                 | Supporting        | FR2, FR4           |
| Search clear button           | Clears a present query through the shared field clear action.                                     | Field component                | Supporting        | FR2, FR4           |
| Option row                    | Presents one option or the select-all choice and owns row interaction/state.                      | Current source and public docs | Prominent         | FR2, FR3           |
| Option checkbox indicator     | Presents the option's selected, unselected, or indeterminate state through CheckboxInput.         | CheckboxInput component        | Supporting        | FR2, FR4           |
| Option divider                | Separates adjacent groups when a public divider entry is present in the options data.             | Divider component              | Supporting        | FR2, FR4           |
| Section heading               | Labels a visible group of option rows.                                                            | Current source and public docs | Supporting        | FR2, FR3           |
| Empty state                   | Presents no-options or no-results content when the panel has no selectable rows to show.          | Current source and public docs | Prominent         | FR2, FR3           |
| Pointer popup                 | Paints the anchored pointer surface around the shared panel content.                              | Current source and public docs | Prominent         | FR3, FR5           |
| Touch sheet heading           | Names the bottom-sheet presentation above the shared panel content.                               | Text component                 | Prominent         | FR4, FR5           |
| Touch sheet                   | Paints the BottomSheet surface around the same shared panel content.                              | BottomSheet component          | Prominent         | FR4, FR5           |

The seven current MultiSelector targets remain on their shipped visible elements.
Nested shared primitives keep their own owners. The Pointer popup and Touch sheet
are intentionally separate rows because they use different surface owners; the
Touch sheet adds a Heading owned by Text. Search, option, divider, section, and
empty-state content remains one shared tree.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Field": {"delegatesTo": {"owner": "component:Field", "target": "field"}},
  "Trigger": {"target": "multi-selector"},
  "Icon-rendered start icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Caller-rendered start content": {
    "none": {
      "reason": "intentional: Arbitrary ReactNode content is caller-owned and receives no MultiSelector target."
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
  "Indicator icon": {"target": "multi-selector-indicator-icon"},
  "Search row": {"target": "multi-selector-search"},
  "Search icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Search clear button": {
    "delegatesTo": {
      "owner": "component:Field",
      "target": "input-clear-button"
    }
  },
  "Option row": {"target": "multi-selector-option"},
  "Option checkbox indicator": {
    "delegatesTo": {
      "owner": "component:CheckboxInput",
      "target": "checkbox-indicator"
    }
  },
  "Option divider": {
    "delegatesTo": {"owner": "component:Divider", "target": "divider"}
  },
  "Section heading": {"target": "multi-selector-section-heading"},
  "Empty state": {"target": "multi-selector-empty-state"},
  "Pointer popup": {"target": "multi-selector-popup"},
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

## Family and system relationships

- `architecture:public-component-api` and `spec:AST-006/DEC-1` own the additive
  read-only API and its cross-input meaning.
- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, delegation, and exclusion of deprecated aliases.
- `architecture:layer-runtime` owns the current Popover host and the distinction
  between browser popover and native-dialog sheet presentation.
- `family:overlay-dismissal` owns shared Escape and platform-close ordering. The
  Pointer popup participates through its composed Popover owner; the Touch sheet
  inherits BottomSheet's current local-only adoption gap.
- Field, CheckboxInput, Divider, Icon, Text, and BottomSheet retain ownership of
  their delegated targets and presentation.

## Verification map

| Contract            | Verification                                                                                                                             | Representative states                                                            | Mutation or failure expectation                                                                                             | Audit section                       |
| ------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------------------------------- |
| FR1, FR2            | `MultiSelector.test.tsx` render, search, divider, grouping, status, select-all, and empty-state suites plus InputGroup source inspection | Standalone/InputGroup, search, divided, selected, empty, status                  | Removing a documented part or misreporting Field presence conflicts with existing structure, content assertions, or source. | `audit:MultiSelector/anatomy`       |
| FR3, FR6            | Component target suites, source inspection, and public target inventory                                                                  | All seven current targets and deprecated alias                                   | A current target is missed, invented, moved, or confused with the deprecated clear-icon alias.                              | `audit:MultiSelector/theming`       |
| FR4                 | Composed owner source/tests for Field, CheckboxInput, Divider, Icon, Text, and BottomSheet                                               | Field omission/presence, clear actions, checkbox, divider, icons, heading, sheet | A shared part gains the wrong local owner or its documented owner no longer renders it.                                     | `audit:MultiSelector/theming`       |
| FR5                 | `MultiSelector.test.tsx` presentation suites and `panelContent` source inspection                                                        | Explicit popover, explicit sheet, adaptive touch                                 | A presentation stops using its owner or receives a divergent panel-content implementation.                                  | `audit:MultiSelector/overlay`       |
| FR7                 | read-only interaction, form, ARIA, and theme-state tests                                                                                 | search/non-search, clearable, open→read-only, disabled precedence                | A value changes, popup or edit affordance remains, form value disappears, or read-only semantics are absent.                | `audit:MultiSelector/accessibility` |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                                                                                            | Canonical anatomy and current local targets                                      | Missing, extra, prefixed, stale, or multiply assigned mappings fail repository validation.                                  | `audit:MultiSelector/theming`       |

Existing component tests directly assert the Trigger, Indicator icon, Search row,
Option row, Section heading, Empty state, and Pointer popup targets. Presentation
tests directly distinguish the Popover and BottomSheet branches. Source inspection
distinguishes standalone Field presence from InputGroup omission and confirms that both surface branches receive the same `panelContent`, while the touch branch
adds Heading; Divider, Text, BottomSheet, and other shared primitive tests provide
owner evidence rather than new MultiSelector targets.

## Decision log

None. This draft records current facts and introduces no component-local design,
API, theming, or layer-system decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, search or selection
algorithms, implementation steps, or shared layer and theming rules. It links to
their owners.
