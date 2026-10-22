---
schema_version: 3
template_version: 6
kind: component
id: component:CheckIndicator
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/Indicator/Indicator.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/Indicator.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: []
---

# CheckIndicator component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                   |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `CheckIndicator` is exported from `@astryxdesign/core/Indicator`; `state` is required, `size` defaults to `md`, `isDisabled` defaults to `false`, and `children` may replace the built-in mark.                                                            |
| Behavior                | The component draws a decorative check glyph only when checked. Shallow-renderable `children` replace that glyph in either state; unchecked without replacement content renders no element.                                                                |
| End-user impact         | People receive one selection cue from the owning control without a duplicate accessible object or an empty placeholder beside unselected rows.                                                                                                             |
| Builder impact          | Builders may replace the named `check` indicator or compose host-owned classes and styling without taking over the owning control's semantics.                                                                                                             |
| Compatibility/readiness | The released component and default state behavior remain unchanged. The checked glyph path currently drops the declared `ref`; this draft records that current-authority gap without choosing a new DOM or ref contract.                                   |
| Review checks           | Reject lost `aria-hidden`, a mark in the unchecked default, a missing checked mark, dropped supported DOM/styling passthrough, changed replacement precedence, a new component-owned theme target, or any claim that the checked-path ref gap is resolved. |
| Governing rules         | `architecture:public-component-api/INV1,INV5,INV6,INV8,INV9`; `architecture:component-theming-surface/INV3–INV6`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`.                                                                         |

This table is a review projection; the body below is authoritative only after owner approval.

## Intent

Render the replaceable, decorative checkmark used by a host to show that one option is chosen, without taking ownership of selection semantics, interaction, or persistent control chrome.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: observational only; no runtime or public-type change
- Controlled/uncontrolled behavior: not applicable; `state` is supplied by the owner
- Migration decision: none; the public component and `check` registry name remain unchanged

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The checked glyph, unchecked absence, disabled color, size mapping, replacement-content precedence, and decorative root.
- Supported neutral DOM and styling passthrough on every rendered root. The replacement-content span receives the declared ref; the checked Icon path currently does not.

**Does not own / non-goals**

- Selection role, accessible name, state, focus, keyboard, activation, or busy semantics — owned by the composing control.
- Persistent checkbox or radio chrome — owned by `component:CheckboxIndicator` or `component:RadioIndicator`.
- Row placement and logical-edge layout — owned by the host component.
- The behavior or accessibility of consumer-supplied replacement content.

## Public concepts

| Concept             | Closed values or states     | Meaning                                                                                                                                                                     | Availability by variant/orientation/state             | Default            | Owner                      | Stability                                  | Invalid-value behavior                             |
| ------------------- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- | ------------------ | -------------------------- | ------------------------------------------ | -------------------------------------------------- |
| state               | `unchecked`, `checked`      | Selects whether the built-in check glyph is absent or present.                                                                                                              | Every render path.                                    | required           | `component:CheckIndicator` | stable                                     | rejected by the public type                        |
| size                | `sm`, `md`                  | Selects the shared indicator size; both current values use the `sm` Icon glyph.                                                                                             | Checked and replacement-content roots.                | `md`               | `component:CheckIndicator` | stable                                     | rejected by the public type                        |
| disabled appearance | enabled, disabled           | Mirrors the owning control's disabled color without creating semantics.                                                                                                     | Checked and replacement-content roots.                | enabled            | `component:CheckIndicator` | stable                                     | boolean only                                       |
| replacement content | shallow renderable or empty | Replaces the built-in mark in either state when `isRenderable(children)` returns true. React elements and containers take this branch even when descendants render nothing. | Every state; replacement content creates a span root. | built-in mark path | `component:CheckIndicator` | observed; empty-container policy unsettled | unsupported values follow React rendering behavior |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                              | Basis                                                                     | Draft review state |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------ |
| FR1 | The component MUST render one decorative check glyph when `state="checked"` and no replacement content is present, and MUST set its own `aria-hidden="true"` after caller passthrough.                                                                                                                                                                           | shipped source; `architecture:public-component-api/INV5`                  | verify             |
| FR2 | The default component MUST render no element when `state="unchecked"` and no replacement content is present.                                                                                                                                                                                                                                                     | shipped source, docs, tests, and stories                                  | verify             |
| FR3 | The current implementation uses shallow `isRenderable(children)` replacement precedence in both states: nullish values, booleans, and the empty string keep the built-in state behavior; React elements and containers replace it even when descendants render nothing. This draft does not settle whether empty-container behavior should remain public policy. | shipped source and regression tests                                       | verify             |
| FR4 | Every rendered root MUST preserve supported DOM props, `className`, `style`, and `xstyle` while keeping component-owned accessibility precedence. Under `architecture:public-component-api/INV8`, the declared ref also MUST reach the promised root; the replacement-content span does, but the checked Icon path currently drops it.                           | `architecture:public-component-api/INV5,INV6,INV8`; shipped source review | human decision     |
| FR5 | The built-in checked mark MUST remain an Icon-owned painter on the same element as host-supplied classes; CheckIndicator MUST NOT add a wrapper or a distinct public target without an approved contract change.                                                                                                                                                 | shipped source; `architecture:component-theming-surface/INV3–INV5`        | verify             |
| FR6 | Disabled color and replacement-content color MUST continue to use semantic tokens rather than raw color values.                                                                                                                                                                                                                                                  | shipped source; current token and theming architecture                    | verify             |

### Allowed variation

- **AV1 — Theme paint.** The Icon target and host-owned class may change supported paint without changing state or semantic ownership.
- **AV2 — Replacement component.** A theme may replace the named `check` indicator when the replacement preserves this public prop and decorative-ownership contract.

### Representative states

| State               | Required invariant                                                                              | Allowed variation                 |
| ------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------- |
| unchecked           | No built-in element is rendered.                                                                | A replacement component may draw. |
| checked             | One decorative check glyph is rendered.                                                         | Icon- and host-owned theme paint. |
| disabled            | Checked or replacement content keeps the requested state and uses the disabled semantic color.  | Theme-owned inactive treatment.   |
| replacement content | Shallow-renderable content replaces the built-in mark in a centered fixed-size decorative root. | Caller-owned decorative content.  |

### Transformation and precedence order

- **ORD1 — Render precedence.** Shallow replacement-content decision → unchecked absence or checked Icon → caller passthrough → component-owned `aria-hidden` → merged theme/style inputs.

### Performance and resources

- **PR1 — Pure render.** The component owns no state, Effect, listener, observer, timer, or external resource.

## Accessibility contract

- **AR1 — Decorative ownership.** Every rendered root remains `aria-hidden`; the composing control owns role, name, state, focus, keyboard, activation, and form semantics.
- **AR2 — Replacement boundary.** Replacement content is decorative within the hidden root and MUST NOT be the only semantic expression of the owning control's selected or busy state.

## Design relationships

| Anatomy or state | Design requirement                                      | Representation authority                | Hierarchy role       | Component contract |
| ---------------- | ------------------------------------------------------- | --------------------------------------- | -------------------- | ------------------ |
| Chrome           | CheckIndicator intentionally owns no persistent chrome. | observed shipped representation         | not applicable       | FR2, FR5           |
| State mark       | Checked state renders the shared decorative check Icon. | Icon-owned current theming architecture | supporting state cue | FR1, FR5–FR6       |

The shared `Indicator.doc.mjs` owns anatomy and targets for CheckboxIndicator, CheckIndicator, and RadioIndicator together. This component draft does not add an `anatomy-theming:v1` block while that shared consumer record remains the canonical cross-component inventory; the block is optional during migration. CheckIndicator owns no persistent chrome and delegates its built-in checked mark to Icon.

## Family and system relationships

- `architecture:component-theming-surface` owns target placement and composed-painter ownership.
- `architecture:public-component-api` owns export, passthrough, styling composition, ref, and compatibility requirements.
- `architecture:component-test-sufficiency` owns the evidence needed for each critical promise and distinct risk partition.

## Verification map

| Contract    | Verification                                                | Representative states                                                                   | Mutation or failure expectation                                                                                             | Audit section                   |
| ----------- | ----------------------------------------------------------- | --------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| FR1–FR3     | `Indicator.test.tsx` state and replacement-content cases    | checked, unchecked, empty scalar, visible child, numeric 0                              | Removing the glyph, adding unchecked chrome, or choosing the wrong children branch fails DOM assertions.                    | `audit:CheckIndicator/behavior` |
| FR1, AR1    | `Indicator.test.tsx` decorative-contract cases              | glyph and replacement roots; hostile `aria-hidden` input                                | Removing or reordering owned `aria-hidden` exposes duplicate semantics.                                                     | `audit:CheckIndicator/a11y`     |
| FR4         | `Indicator.test.tsx`, strict lint, and source review        | neutral DOM props on both roots; replacement-root class; checked-path style composition | Passthrough stops reaching a rendered root or the checked Icon stops receiving composed `className`, `style`, and `xstyle`. | `audit:CheckIndicator/api`      |
| FR4 ref gap | source review                                               | checked Icon root and replacement-content span                                          | The declared ref remains `null` on the checked path while reaching the replacement span.                                    | `audit:CheckIndicator/api`      |
| FR5–FR6     | source review, Icon target guards, and rendered evidence    | checked, disabled, replacement content; light/dark                                      | A wrapper separates the host target from the painter or semantic color stops reaching the mark.                             | `audit:CheckIndicator/theming`  |
| All         | `Indicator.stories.tsx`, component-scoped axe and RTL audit | all states, sizes, disabled, replacement content                                        | A required rendered state is unreachable or gains an accessibility/RTL failure.                                             | `audit:CheckIndicator/testing`  |

## Decision log

None. This draft records only verified shipped behavior.

## Open questions

- **OQ1 — Should CheckIndicator preserve its declared `HTMLSpanElement` ref by owning a stable span root in the checked path, or should the public ref contract change to match the Icon-owned painter?** (`human-api`) The current checked path returns `null`; either correction changes a released DOM or ref contract.
- **OQ2 — Should empty React containers continue to suppress the built-in state mark?** (`human-api`) This observational draft records the current shallow branch without approving it as future policy.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit results, implementation steps, or family/system rules. It links to their owners.
