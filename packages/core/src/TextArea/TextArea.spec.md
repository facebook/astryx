---
schema_version: 3
template_version: 7
kind: component
id: component:TextArea
authority: current
archive_reason: null
superseded_by: null
approved_by: cixzhang
approved_at: 2026-10-27
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/TextArea/TextArea.test.tsx,
    packages/core/src/TextArea/TextArea.fr10.test.tsx,
    packages/core/src/TextInput/__tests__/TextInput.a11y.test.tsx,
    packages/core/src/TextInput/__tests__/TextInput.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: [family:input-fields]
design_specs: []
architecture:
  [
    architecture:component-size-cascade,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-085, spec:AST-086]
---

# TextArea component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                  |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | None changes. TextArea is a controlled multi-line field with Field props, `rows`, size, status, start icon, `maxLength` counter, `onChange`, `changeAction`, `isLoading`, disabled and read-only states, and the input-family part props. |
| Behavior                | Typing calls `onChange`, then an optional `changeAction` with an optimistic value and one busy Spinner. `maxLength` adds a visual character counter that warns but never blocks typing.                                                   |
| End-user impact         | People write longer text with a live count that is announced only when they near or pass the limit. Keyboard and screen-reader users can reach a disabled field and its reason. An error without a message has no text.                   |
| Builder impact          | None.                                                                                                                                                                                                                                     |
| Compatibility/readiness | Records shipped behavior; no API, default, or DOM change. Default attached status on a tall surface, an error without text, and a color-only `detached` status are listed under Current-state impact.                                     |
| Review checks           | Reject a counter that truncates input or counts code units, an announcement on every keystroke, text that runs under the icons or counter, a disabled field that leaves the tab order or submits, or root styling props.                  |
| Governing rules         | `family:input-fields` FR4–FR6, FR8–FR10, AV3; `spec:AST-085` FR1–FR3, FR6; `spec:AST-086` FR8; `architecture:component-theming-surface`.                                                                                                  |

This table is a review projection; the body below is authoritative.

## Intent

TextArea collects multi-line text. It owns the native textarea, its change and
Action pipeline, the character counter, overlay icon placement, and disabled
and read-only behavior under `family:input-fields`. Consumer usage lives in
`TextArea.doc.mjs`.

## Compatibility and migration

- Released default preserved: `yes`; `rows={3}`, spellcheck on, `size="md"`,
  `statusVariant="attached"`
- Compatibility class: records shipped behavior; no public prop, default,
  export, or DOM change. TextArea emits only the `text-area`,
  `text-area-control`, and `text-area-counter` targets
- Controlled/uncontrolled behavior: controlled only; `value` is required, and
  the field shows an optimistic value only while a `changeAction` is pending
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted input container, native textarea, and character counter, with
  their `text-area`, `text-area-control`, and `text-area-counter` targets.
- The change and Action pipeline and the busy state.
- The counter's counting, over-limit cue, and announcements.
- Overlay placement of the start icon, Spinner, status icon, and counter, and
  the text padding that keeps text clear of them.
- Disabled, disabled-reason, and read-only behavior.

**Does not own / non-goals**

- Label and attached/detached validation-message presentation — owned by
  Field under `family:input-fields` (shared owner section) and
  `component:FieldStatus`.
- The tooltip-variant status surface — owned by Tooltip.
- Standard start-icon presentation and the shared on-field status icon — owned
  by `component:Icon` and the shared input-field status icon under
  `family:input-fields`, respectively.
- Loading-indicator presentation — owned by `component:Spinner`.
- Caller-provided custom start content outside Icon's supported source forms.
- InputGroup — TextArea is not admitted (`family:input-fields` adoption).
- Enforcing `maxLength` — the counter is visual only.

## Public concepts

| Concept      | Closed values or states       | Meaning                                            | Availability by variant/orientation/state          | Default                   | Owner                 | Stability | Invalid-value behavior           |
| ------------ | ----------------------------- | -------------------------------------------------- | -------------------------------------------------- | ------------------------- | --------------------- | --------- | -------------------------------- |
| Rows         | positive integer              | Initial visible lines; the user may resize taller. | Always.                                            | `3`                       | `component:TextArea`  | Stable    | Passed to the native attribute.  |
| Size         | `sm`, `md`, `lg`              | Text inset; `lg` adds block padding.               | Always.                                            | Inherited size, else `md` | `family:input-fields` | Stable    | TypeScript rejects other values. |
| Counter      | under, near, over             | Character count against `maxLength`.               | When `maxLength` is set.                           | none                      | `component:TextArea`  | Stable    | Not applicable.                  |
| Busy         | idle, busy                    | The value is loading or being saved.               | `isLoading`, or while a `changeAction` is pending. | idle                      | `family:input-fields` | Stable    | Not applicable.                  |
| Availability | editable, read-only, disabled | Whether the value can change and submits.          | Always; disabled wins.                             | editable                  | `component:TextArea`  | Stable    | Not applicable.                  |

## Behavioral and layout contract

| ID   | Invariant                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Basis                                                                 |
| ---- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------- |
| FR1  | TextArea renders inside Field (label, description, optional or required marker, label tooltip, status, `width`) and places the native textarea inside its painted input container. It has no grouped adaptation and renders the same way inside InputGroup.                                                                                                                                                                                                                                                                                                                                                                                                                                        | `family:input-fields` adoption; current source and tests              |
| FR2  | The input container carries `text-area` with `data-size`, `data-status`, `data-disabled`, and `data-readonly`; the textarea carries `text-area-control`; the counter carries `text-area-counter`. Placeholder text is part of the textarea; the over-limit glyph is part of the counter.                                                                                                                                                                                                                                                                                                                                                                                                           | `architecture:component-theming-surface`; current source and tests    |
| FR3  | The textarea shows `rows` lines (default 3), resizes only vertically, and uses body text, floored at 16 CSS px only on the iOS touch path. `lg` adds block padding; `sm` and `md` share the default inset.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         | `family:input-fields` FR9, AV3; current source and tests              |
| FR4  | Editing calls `onChange(value, event)`; unless that call prevents default, `changeAction(value, event)` then runs in a transition and the field shows the proposed value while the Action is pending, and `value` once it settles. While `isLoading` or while the shown value differs from `value`, the textarea sets `aria-busy`, a decorative Spinner shows, and the busy start is announced once.                                                                                                                                                                                                                                                                                               | `family:input-fields` FR5, FR6; `spec:AST-086` FR8; current tests     |
| FR5  | With `maxLength`, a counter `count/max` renders at the container's bottom end and describes the textarea. It counts user-perceived characters, so a multi-code-point emoji counts once. It never sets the native `maxLength` and never blocks typing. Over the limit it turns the error color, adds a decorative warning icon, and sets `aria-invalid`.                                                                                                                                                                                                                                                                                                                                            | Current tests                                                         |
| FR6  | Counter announcements happen only when the count changes zone: entering the last 20% of the limit announces the remaining characters politely; exceeding the limit announces the overage assertively; moving back under announces nothing.                                                                                                                                                                                                                                                                                                                                                                                                                                                         | Current tests                                                         |
| FR7  | The start icon renders at the top start, and the Spinner and on-field status icon at the top end; the textarea reserves inline padding for each one that renders (more when both end items show) and bottom padding for the counter, so text never runs under them. A detached status reserves no end space because it renders no on-field icon.                                                                                                                                                                                                                                                                                                                                                   | `family:input-fields` FR2; current source and tests                   |
| FR8  | A status paints the status border; `error` sets `aria-invalid`. The on-field status icon shows for `attached` and `tooltip` placement; a `detached` status shows its glyph only in the message box, which renders only with a message. The message renders through Field in the chosen placement. Every status MUST show a cue other than color (WCAG 2.2 1.4.1), and an error MUST be identified in text (WCAG 2.2 3.3.1). Implementation gap: `statusVariant` defaults to `attached`, which `family:input-fields` FR8 does not let this tall surface take from the shared default; an error status may have no message; and a `detached` status without a message shows only the colored border. | `family:input-fields` FR8; current tests                              |
| FR9  | Disabled: `aria-disabled="true"` and `readOnly` on the textarea, a kept tab stop, no `name` (not submitted), no value change, no `onPaste`, no caller handlers other than focus and blur, a dimmed container, and a keyboard focus ring. With `disabledMessage`, a reason tooltip opens on hover and keyboard focus and describes the textarea.                                                                                                                                                                                                                                                                                                                                                    | `spec:AST-085` FR1–FR3, FR6; `family:input-fields` FR4; current tests |
| FR10 | Read-only: `readOnly`, full opacity, focusable, still submitted, never calls `onChange`. Disabled wins when both are set.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          | Current tests                                                         |
| FR11 | `hasSpellCheck` (default on) sets `spellcheck`; `htmlName`, `autoComplete`, `hasAutoFocus`, and `onPaste` reach the textarea. A click on the container outside the textarea focuses it, except while disabled or busy.                                                                                                                                                                                                                                                                                                                                                                                                                                                                             | Current tests                                                         |
| FR12 | Base props reach the textarea and `aria-describedby` joins TextArea's descriptions; `container*` reaches the Field box and `control*` the input container; root `xstyle`, `className`, and `style` are not accepted.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               | `family:input-fields` FR10; current tests                             |

### Allowed variation

- **AV1 — Height.** The user may drag the textarea taller; content may grow
  past `rows`.
- **AV2 — Start content.** Icon-supported values or caller content may fill the
  start slot.

### Representative states

| State                | Required invariant                                                                   | Allowed variation                  |
| -------------------- | ------------------------------------------------------------------------------------ | ---------------------------------- |
| Default editable     | Label, input container, and textarea render.                                         | Value, placeholder, rows, and size |
| Near the limit       | Counter visible; one polite remaining-characters announcement.                       | Count.                             |
| Over the limit       | Error-colored counter with warning icon; `aria-invalid`; one assertive announcement. | —                                  |
| Busy with status     | Spinner and status icon both at the top end; extra end padding.                      | Status variant.                    |
| Disabled with reason | Focusable; read-only; not submitted; reason tooltip.                                 | —                                  |

### Transformation and precedence order

- **ORD1 — Availability.** Disabled, then read-only, then editable.
- **ORD2 — Change.** Counter zone check, `onChange`, then the optimistic value
  and `changeAction` unless prevented.
- **ORD3 — Description.** Caller description, then description, status
  message (or status tooltip), counter, and disabled reason.

### Performance and resources

- **PR1 — Counting cost.** Characters are counted only when `maxLength` is set,
  and only when the shown value changes.

## Accessibility contract

- **AR1 — Name and description.** The textarea is labelled by Field and
  described per ORD3, including the counter.
- **AR2 — Counter announcements.** FR6; spoken output follows `spec:AST-009`.
- **AR3 — Over-limit cue.** The over-limit state has a non-color cue (FR5).
- **AR4 — Disabled.** FR9 satisfies `spec:AST-085` FR1, FR5, and FR6.

## Design relationships

| Anatomy or state      | Design requirement                                                   | Representation authority        | Hierarchy role | Component contract |
| --------------------- | -------------------------------------------------------------------- | ------------------------------- | -------------- | ------------------ |
| Input container       | Presents the current painted field boundary.                         | Current source and public docs  | Supporting     | FR1, FR2           |
| Text area             | Presents and edits the current multi-line value.                     | Current source and public docs  | Prominent      | FR1, FR2, FR3      |
| Character counter     | Presents current and maximum character counts.                       | Current source and public docs  | Supporting     | FR2, FR5           |
| Shared field feedback | Presents current label, standard icons, status, and loading content. | Current shared-component source | Supporting     | FR7, FR8           |

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Label": {
    "delegatesTo": {"owner": "component:Field", "target": "field-label"}
  },
  "Description": {
    "none": {
      "reason": "unsettled: No current public target reaches the stable Description; future exposure still needs an owner decision"
    }
  },
  "Input container": {"target": "text-area"},
  "Text area": {"target": "text-area-control"},
  "Placeholder": {"inherits": "text-area-control"},
  "Start icon": {
    "delegatesTo": {"owner": "component:Icon", "target": "icon"}
  },
  "Custom start content": {
    "none": {
      "reason": "intentional: Custom start content is caller-provided ReactNode content outside TextArea's public theming ownership"
    }
  },
  "Spinner": {
    "delegatesTo": {"owner": "component:Spinner", "target": "spinner"}
  },
  "Status icon": {
    "delegatesTo": {
      "owner": "component:Field",
      "target": "input-status-icon"
    }
  },
  "Character counter": {"target": "text-area-counter"},
  "Field status message": {
    "delegatesTo": {
      "owner": "component:FieldStatus",
      "target": "field-status"
    }
  },
  "Tooltip status message": {
    "delegatesTo": {"owner": "component:Tooltip", "target": "tooltip"}
  }
}
```

`Description` remains stable consumer anatomy, but no current public target
reaches it; future exposure remains unsettled. Semantic names and icon component
values render through Icon and delegate to its `icon` target; arbitrary ReactNode
start content is caller-provided and intentionally stays outside TextArea's
public theming ownership. Attached and detached status messages delegate to
FieldStatus, while the tooltip variant delegates its rendered surface to Tooltip.

## Family and system relationships

- `family:input-fields` owns busy, Transition Actions, disabled reasons,
  status placement, the focus-zoom floor, prop targets, and block-axis growth;
  TextArea adopts them and is not InputGroup-compatible.
- `architecture:component-theming-surface` owns anatomy qualification, factual
  `none` dispositions, composition-preserving ownership, and alias exclusion.
- Field, FieldStatus, Icon, Spinner, and Tooltip retain their own target
  contracts when composed by TextArea.
- `spec:AST-085` owns disabled focusability; TextArea meets it.

## Verification map

| Contract             | Verification                                                                                                                                                                       | Representative states                         | Mutation or failure expectation                                                                                                                                                    | Audit section                  |
| -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| FR1, FR3             | `TextArea.test.tsx` structure, rows, and size cases                                                                                                                                | Default, custom rows, `lg`                    | Removing or regrouping stable parts breaks role, content, or DOM assertions. Evidence gap: no test asserts vertical-only resize, the body text and iOS floor, or the `lg` padding. | `audit:TextArea/anatomy`       |
| FR2                  | `TextArea.test.tsx` root-target and theme-state suites; `themingTargets.test.ts`                                                                                                   | Three local targets; disabled and read-only   | A missing class or state attribute, or source and docs drift, fails.                                                                                                               | `audit:TextArea/theming`       |
| FR4                  | `TextArea.test.tsx` change and busy cases                                                                                                                                          | Typing; `isLoading`                           | A wrong `onChange` payload or no `aria-busy` fails. Evidence gap: no test asserts `changeAction` after `onChange`, the optimistic value, or the busy announcement.                 | `audit:TextArea/behavior`      |
| FR5, FR6, AR2, AR3   | `TextArea.test.tsx` maxLength suite                                                                                                                                                | Under, near, over; emoji; controlled typing   | Native truncation, code-unit counting, a missing cue, or repeated announcements fail.                                                                                              | `audit:TextArea/accessibility` |
| FR7, FR8             | `TextArea.test.tsx` status, busy-with-status, and statusVariant suites                                                                                                             | Attached, detached, tooltip; busy with status | Text under an icon, or end space reserved for an absent icon, fails. Evidence gap: no test measures the reserved padding, or renders a `detached` status without a message.        | `audit:TextArea/layout`        |
| FR9, FR10, ORD1, AR4 | `TextArea.test.tsx` disabled, disabledMessage, read-only, and form suites                                                                                                          | Disabled, with reason, read-only, both        | A lost tab stop, a submitted disabled value, a caller handler, or an edit fails. Evidence gap: no test pastes into a disabled textarea.                                            | `audit:TextArea/accessibility` |
| FR11                 | `TextArea.test.tsx` spellcheck, paste, autoComplete, autofocus, click-to-focus suites                                                                                              | Each prop                                     | A dropped attribute or unfocused click fails. Evidence gap: no test clicks the container while disabled or busy.                                                                   | `audit:TextArea/behavior`      |
| FR12                 | `TextArea.fr10.test.tsx`                                                                                                                                                           | Standalone                                    | A base prop off the textarea, or styling on the wrong part, fails.                                                                                                                 | `audit:TextArea/api`           |
| ORD2, ORD3, PR1      | ORD3 is covered by the status and counter description cases. Evidence gap: no test asserts the counter-zone, change, and Action order, or that counting runs only with `maxLength` | —                                             | —                                                                                                                                                                                  | `audit:TextArea/behavior`      |
| AR1                  | `TextInput.a11y.test.tsx` and `TextInput.a11y.chromium.spec.ts` TextArea states                                                                                                    | Empty with placeholder; error without message | A missing name or description fails; the recorded known failure stops matching when its gap closes.                                                                                | `audit:TextArea/accessibility` |
| Theming anatomy map  | `scripts/check-knowledge.mjs`                                                                                                                                                      | Canonical anatomy and current local targets   | Canonical-key drift, invalid dispositions or target spelling, alias-backed local claims, or an unclaimed current local target fails validation.                                    | `audit:TextArea/theming`       |

No repository check resolves `delegatesTo` owner and target pairs; the pairs
above match the current Field, FieldStatus, Icon, Spinner, and Tooltip targets.

## Current-state impact

- **Attached status on a tall surface (FR8).** TextArea defaults to `attached`
  status placement, while `family:input-fields` FR8 names TextArea among the
  tall surfaces that cannot take attached from the shared default.
- **Error without text.** TextArea accepts an error status without a message,
  so the error is shown only by color and an icon, against WCAG 2.2 3.3.1. The
  shared text-input accessibility suite records this as a known failure.
- **Color-only detached status (FR8).** A `detached` status without a message
  shows only the colored border, against WCAG 2.2 1.4.1.

## Decision log

No component-local decision. TextArea applies `family:input-fields` and
`spec:AST-085`.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit
results, implementation steps, or family/system rules. It links to their owners.
