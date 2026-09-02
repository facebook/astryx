---
schema_version: 3
template_version: 3
kind: component
id: component:NavHeadingMenu
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [behavior, theming, accessibility]
verified_by:
  [
    packages/core/src/NavMenu/NavHeadingMenu.test.tsx,
    packages/core/src/Icon/Icon.test.tsx,
    packages/core/src/Text/Text.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:navigation-destinations]
design_specs: []
architecture:
  [
    architecture:component-theming-surface,
    architecture:icon-resolution-and-component-slots,
    architecture:layer-runtime,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-005/DEC-1]
---

# NavHeadingMenu component contract

## Intent

NavHeadingMenu presents selectable actions inside a SideNavHeading or
TopNavHeading popover. This draft records the current consumer anatomy and
theming ownership without changing rendering, keyboard behavior, layer
lifecycle, targets, or public API.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive documentation only; runtime, DOM, styling,
  targets, and public API remain unchanged
- Controlled/uncontrolled behavior: unchanged
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The Menu container, menu semantics, keyboard movement, typeahead, and current
  `nav-heading-menu` target.
- Each Item's action/link row, selection handling, size treatment, and current
  `nav-heading-menu-item` target.
- The content layout that contains either the text-rendered or caller-rendered
  label path and the optional description.

**Does not own / non-goals**

- Icon artwork and the `icon` target — delegated to `component:Icon` for values
  rendered through Icon.
- String label and description typography and their `text` target — delegated to
  `component:Text`.
- Non-string label content — owned by the caller.
- The SideNavHeading or TopNavHeading trigger, popup surface, positioning,
  dismissal lifecycle, or close-state ownership.
- New NavHeadingMenu targets for either label path or Item description, or any
  runtime, API, target, or DOM change.

## Public concepts

No new public concept is introduced. The canonical `NavMenu.doc.mjs` continues
to document NavHeadingMenu and NavHeadingMenuItem together.

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                  | Basis                           | Draft review state                                      |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------------------------------------- |
| FR1 | NavHeadingMenu renders one Menu carrying `role="menu"` and the current `nav-heading-menu` target.                                                                                                    | Current source, docs, and tests | Verified current behavior; no new behavior decided      |
| FR2 | NavHeadingMenuItem renders one Item carrying `role="menuitem"` and the current `nav-heading-menu-item` target as a link when `href` is supplied and a div otherwise.                                 | Current source, docs, and tests | Verified current behavior; no target change             |
| FR3 | An optional Icon-rendered icon delegates to Icon's `icon` target. String labels and all descriptions render through Text's `text` target; non-string labels render directly as caller-owned content. | Current source and target docs  | Verified current ownership; focused evidence is partial |
| FR4 | The parent nav heading supplies the close callback and owns its popup runtime; NavHeadingMenu consumes that callback for Escape and successful Item selection.                                       | Current source and tests        | Verified current relationship; no layer change          |

### Allowed variation

- Items may render as links or callback actions and may be enabled or disabled
  without changing anatomy ownership.
- Icon may be absent. A label may take the string path rendered through Text or
  the non-string path rendered directly as caller-owned content. Item
  description may be absent and, when present, renders through Text.
- Menu size and minimum width may vary without creating separate anatomy parts
  or targets.

### Representative states

| State             | Required invariant                                                | Allowed variation                                         |
| ----------------- | ----------------------------------------------------------------- | --------------------------------------------------------- |
| Link Item         | Item is an anchor with menuitem semantics and its current target. | Destination, text, description, and icon may vary.        |
| Action Item       | Item is a div with menuitem semantics and its current target.     | Selection callback may vary.                              |
| Disabled Item     | Item remains present and reflects disabled semantics.             | It is skipped by keyboard navigation and typeahead.       |
| String-label Item | Text-rendered item label delegates to Text's current target.      | Label value, destination, description, and icon may vary. |
| Custom-label Item | Caller-rendered item label remains caller-owned.                  | Caller controls the non-string label content.             |
| Described Item    | Item description delegates to Text's current target.              | Description content may vary or be absent.                |

### Transformation and precedence order

- No new focus, typeahead, activation, close, size, or styling precedence rule
  is introduced.

### Performance and resources

- No new performance or resource rule is introduced.

## Accessibility contract

This draft does not change or extend the current menu/menuitem roles, disabled
state, arrow/Home/End/Escape movement, typeahead, keyboard activation, or caller
labeling behavior.

## Design relationships

| Anatomy or state           | Design requirement                                                        | Representation authority       | Hierarchy role    | Component contract |
| -------------------------- | ------------------------------------------------------------------------- | ------------------------------ | ----------------- | ------------------ |
| Menu                       | Groups nav-heading actions with menu semantics and keyboard navigation.   | Current source and public docs | Prominent         | FR1, FR4           |
| Item                       | Presents one selectable action or navigation destination.                 | Current source and public docs | Prominent         | FR2                |
| Icon                       | Presents optional Icon-owned artwork before the label.                    | `component:Icon`               | Supporting        | FR3                |
| Text-rendered item label   | Presents a string label through Text's body treatment.                    | `component:Text`               | Prominent         | FR2, FR3           |
| Caller-rendered item label | Presents a non-string label directly through caller-owned content.        | Caller-supplied content        | Context-dependent | FR2, FR3           |
| Item description           | Presents optional supporting content through Text's supporting treatment. | `component:Text`               | Supporting        | FR2, FR3           |

The menu is popup content, not the popup host. SideNavHeading or TopNavHeading
owns the layer lifecycle and supplies the close callback through context.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Menu": {"target": "nav-heading-menu"},
  "Item": {"target": "nav-heading-menu-item"},
  "Icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Text-rendered item label": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  },
  "Caller-rendered item label": {
    "none": {
      "reason": "intentional: Non-string label content is rendered directly and remains caller-owned"
    }
  },
  "Item description": {
    "delegatesTo": {"owner": "component:Text", "target": "text"}
  }
}
```

## Family and system relationships

- `architecture:component-theming-surface` owns anatomy qualification, local
  target mapping, component delegation, and factual `none` dispositions.
- `architecture:icon-resolution-and-component-slots` owns Icon slot resolution;
  this draft records the current Icon delegation without changing slot behavior.
- `architecture:layer-runtime` owns the shared popup host lifecycle used by the
  parent nav heading. NavHeadingMenu owns only its menu behavior and consumes the
  heading-provided close callback.
- `architecture:public-component-api` owns the stable props and subcomponent
  surface; this documentation adds no API.
- `family:navigation-destinations` owns the shared accept/block result for a
  NavHeadingMenuItem `href`; `spec:AST-005/DEC-1` requires native and
  custom-router item paths to preserve that result.
- NavHeadingMenu's current custom-router path inherits the `useLinkComponent`
  adoption gap recorded by the family until the accepted implementation lands.

## Verification map

| Contract            | Verification                                                            | Representative states                                            | Mutation or failure expectation                                                                                                                                                                        | Audit section                   |
| ------------------- | ----------------------------------------------------------------------- | ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| FR1, FR2            | `NavHeadingMenu.test.tsx` role, render, link, and disabled suites       | Menu with link, action, and disabled Items                       | Removing menu/item semantics, content, or current rendering branches fails existing role, tag, attribute, and text checks.                                                                             | `audit:NavHeadingMenu/anatomy`  |
| FR3                 | NavHeadingMenuItem source inspection plus Icon and Text target metadata | Icon, string label, caller-rendered label, and description paths | Source proves Icon-slot delegation, conditional label rendering, and Text-wrapped description; focused tests assert string and description content but not target placement or custom-label ownership. | `audit:NavHeadingMenu/theming`  |
| FR4                 | `NavHeadingMenu.test.tsx` context and keyboard suites                   | Selection, Escape, arrows, Home/End, typeahead                   | Breaking close callback consumption or keyboard behavior fails focused interaction assertions.                                                                                                         | `audit:NavHeadingMenu/behavior` |
| Target inventory    | Source inspection and `themingTargets.test.ts`                          | Menu, Item, and delegated Icon targets                           | Runtime and documented target metadata drift fails target validation.                                                                                                                                  | `audit:NavHeadingMenu/theming`  |
| Theming anatomy map | `scripts/check-knowledge.mjs`                                           | Canonical anatomy and both current local targets                 | Missing, extra, prefixed, or stale mappings fail repository validation.                                                                                                                                | `audit:NavHeadingMenu/theming`  |

Existing tests prove menu/item roles, string-label and description content,
interaction, and the heading-provided close callback. The conditional non-string
label path, Icon target placement, Text target placement, and both local target
placements remain source-inspected rather than pinned by focused assertions.

## Decision log

None. This draft records current facts and introduces no component-local design,
behavior, accessibility, layer, or API decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables, examples, keyboard or layer
algorithms, implementation steps, or system rules. It links to their owners.
