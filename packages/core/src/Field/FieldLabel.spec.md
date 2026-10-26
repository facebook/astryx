---
schema_version: 3
template_version: 7
kind: component
id: component:FieldLabel
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Field/FieldLabel.test.tsx,
    packages/core/src/Field/__tests__/FieldLabelAudit.a11y.chromium.spec.ts,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropReferences.test.ts,
    packages/core/src/docPropLiterals.test.ts,
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
system_specs: [spec:AST-020/FR1]
---

# FieldLabel component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                 |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `FieldLabel` renders a visible or visually hidden label group for one control or a caller-labelled group, with optional description, optionality indicator, icon, tooltip, label-element BaseProps, and label-element ref.               |
| Behavior                | Single-control mode uses a native label; group mode uses a labelled span. A description adds a wrapper div, while caller props and ref stay on the inner label element. Description clicks forward only to one associated control.       |
| End-user impact         | People can identify a control or group, hear supporting text separately from its name, and activate eligible controls from the complete visible label area. The current tooltip remains unavailable to keyboard and screen-reader users. |
| Builder impact          | Builders provide stable control and description IDs, select group mode when labelling a composite, and wire `aria-labelledby` or `aria-describedby` on the controlled surface.                                                           |
| Compatibility/readiness | This draft records released behavior and changes no API. Two gaps remain: group mode renders a span while public types promise label props/ref, and the anonymous tooltip icon exposes its content only to a pointer.                    |
| Review checks           | Reject a lost native/group association, nested description in the accessible name, forwarded clicks from group or interactive description content, dropped label-element props/ref, hidden tooltip content, or undocumented public prop. |
| Governing rules         | Established public interface; HTML label semantics; WCAG 2.2 SC 2.1.1; `architecture:public-component-api/INV1,INV5–INV9,INV12`; `architecture:component-theming-surface/INV3–INV7`; `spec:AST-020/FR1`.                                 |

This table is a review projection; the body below is authoritative.

## Intent

`FieldLabel` supplies the shared label, description, optionality, icon, and tooltip presentation used by Field and labeled controls such as CheckboxInput and Switch. It owns the label group only; the associated control or group owns value and interaction behavior.

## Compatibility and migration

- Released default preserved: yes.
- Compatibility class: observational only; this draft changes no public prop, default, or behavior.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none; OQ1 requires a separate public-type decision. The tooltip accessibility defect remains open.

## Ownership boundary

**Owns**

- Native single-control and non-label group-label element selection.
- Visible and visually hidden label and description presentation.
- Optional/required exception indicators from FormLayout optionality context.
- Safe description-click forwarding for one associated control.
- The `field-label` theme target and composition of caller props, styles, and ref on the label element.
- Whether the optional tooltip trigger is reachable and named for every input modality and assistive-technology path.

**Does not own / non-goals**

- The associated control or group's value, disabled semantics, focus model, keyboard behavior, and ARIA wiring beyond the label's own IDs.
- The caller's layout around the label group.
- Tooltip surface behavior and icon rendering, which delegate to `component:Tooltip` and `component:Icon`; FieldLabel still owns whether its chosen trigger exposes that content.

## Public concepts

| Concept                | Closed values or states                         | Meaning                                                                                   | Availability by variant/orientation/state | Default        | Owner                  | Stability                 | Invalid-value behavior                                                    |
| ---------------------- | ----------------------------------------------- | ----------------------------------------------------------------------------------------- | ----------------------------------------- | -------------- | ---------------------- | ------------------------- | ------------------------------------------------------------------------- |
| label mode             | single control; group                           | Chooses a native `<label htmlFor>` or a `<span>` referenced through `aria-labelledby`.    | All uses.                                 | single control | `component:FieldLabel` | released                  | Boolean-constrained; see OQ1 for root/ref typing.                         |
| label visibility       | visible; visually hidden                        | Keeps label and description accessible while removing their layout space when hidden.     | Both label modes.                         | visible        | `component:FieldLabel` | released                  | Boolean-constrained.                                                      |
| optionality marker     | none; optional; required                        | Shows the localized exception to FormLayout's form-level optionality default.             | Visible and hidden labels.                | none           | `component:FieldLabel` | released                  | When both booleans are true, optional wins visibly.                       |
| leading icon           | absent; icon type; rendered node                | Adds visual content before the label text.                                                | Both label modes.                         | absent         | `component:FieldLabel` | released                  | Rendered through the shared icon slot.                                    |
| explanatory tooltip    | absent; localized string                        | Adds the shared info-icon anchor and tooltip surface after the label.                     | Both label modes.                         | absent         | `component:FieldLabel` | released; conformance gap | The current anonymous, nonfocusable icon leaves the content pointer-only. |
| supporting description | absent; rendered node with optional explicit ID | Keeps supporting content separate from the accessible name and available for description. | Both label modes.                         | absent         | `component:FieldLabel` | released                  | Missing ID leaves association to the caller.                              |
| description activation | forwarding; non-forwarding                      | For one control, noninteractive description clicks mirror native-label activation.        | Single mode only.                         | forwarding     | `component:FieldLabel` | released                  | Group mode and interactive descendants do not forward.                    |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                                                                         | Basis                                                                | Draft review state                  |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------- |
| FR1 | Single-control mode renders `<label htmlFor={inputID}>`; group mode renders a non-label element with `labelID` for caller-owned `aria-labelledby`.                                                                                                                          | Established public interface; HTML and ARIA semantics                | settled observation                 |
| FR2 | Visible and hidden labels retain the label text; hidden label and description boxes remain in the accessibility tree and leave no layout slot.                                                                                                                              | Established public interface                                         | settled observation                 |
| FR3 | Descriptions remain siblings of the label so they do not enter the control's accessible name. Noninteractive description clicks forward to one eligible control; group labels and interactive descendants do not forward activation.                                        | Established public interface; native label behavior                  | settled observation                 |
| FR4 | FormLayout optionality suppresses the matching visible marker; without a form default, the requested marker is localized and shown. When both flags are true, optional wins.                                                                                                | Established public interface and current tests                       | settled observation                 |
| FR5 | Label icons, tooltip anchors, required/optional text, and description content preserve source order. The label element uses a horizontal flex row; the optional label/description wrapper uses block flow. All component-owned spacing is logical or direction-neutral.     | Established public interface and source observation                  | settled observation                 |
| FR6 | Accepted data, ARIA, DOM, class, style, event, and `xstyle` inputs compose on the label element without replacing the component-owned target or association. When a description renders, the outer wrapper is layout-only and caller props stay on the inner label element. | `architecture:public-component-api/INV5–INV7`                        | settled observation for single mode |
| FR7 | The public ref reaches the label element. Group mode currently renders a span while the public BaseProps/ref type is fixed to `HTMLLabelElement`.                                                                                                                           | `architecture:public-component-api/INV8,INV9`; current runtime/types | human decision (OQ1)                |
| FR8 | The optional tooltip currently anchors to an anonymous, nonfocusable info icon, so its explanatory content is unavailable by keyboard and is not announced with the associated field.                                                                                       | WCAG 2.2 SC 2.1.1; `spec:AST-020/FR1`; current runtime               | objective conformance gap           |

### Allowed variation

- **AV1 — Parent layout.** Field, CheckboxInput, Switch, and direct consumers may arrange the label group differently without changing its local semantics.
- **AV2 — Label content.** Icon, tooltip, optionality text, and description content may be absent independently.
- **AV3 — Control kind.** Description activation follows the associated native or custom control's supported click/focus behavior.

### Representative states

| State                 | Required invariant                                                                                             | Allowed variation                                |
| --------------------- | -------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| single label          | Native label association reaches the one control.                                                              | Visible or visually hidden.                      |
| group label           | Label element is not a literal label and is referenceable by `labelID`.                                        | Caller owns group role and `aria-labelledby`.    |
| description           | Supporting content remains outside the label and may expose `descriptionID`.                                   | Text or structured content.                      |
| optional or required  | One localized exception marker follows label text.                                                             | Suppressed when it matches FormLayout's default. |
| disabled presentation | Label uses disabled text treatment and no pointer cursor.                                                      | Associated control owns actual disabled state.   |
| icon and tooltip      | Shared Icon and Tooltip render their owned paint; the current tooltip anchor remains nonfocusable and unnamed. | Either slot may be absent.                       |

### Transformation and precedence order

- **ORD1 — Optionality.** Optional wins when both local booleans are true; otherwise the FormLayout default suppresses its matching marker.
- **ORD2 — Label-element composition.** Component target and base styles apply before caller `xstyle`, class, and inline style composition on the label element; association and label-element choice remain component-owned. An optional description adds a layout wrapper without retargeting those inputs.

### Performance and resources

- **PR1 — No retained resource.** FieldLabel owns no global listener, observer, timer, or external store. Description activation reuses the shared input-container hook with local refs.

## Accessibility contract

- **AR1 — Label association.** Single controls use native label association; grouped controls use a caller-wired labelled span and never a misleading literal label.
- **AR2 — Description separation.** Description content stays outside the label so it is not duplicated in the accessible name and exposes an ID for caller-owned `aria-describedby`.
- **AR3 — Hidden labels.** Visually hidden label and description content remain programmatically available.
- **AR4 — Activation boundary.** Description activation never hijacks interactive descendants and never forwards from a group label to one control.
- **AR5 — Tooltip reachability.** The current anonymous, nonfocusable tooltip anchor does not expose its explanatory content to keyboard or screen-reader users; this remains an objective conformance gap.

## Design relationships

No current repository design record governs component-local visual tuning. The implementation uses shared semantic type, color, spacing, and disabled tokens; rendered evidence records the resulting states without turning them into policy.

## Family and system relationships

- `architecture:public-component-api` owns exports, label-element prop composition, ref accuracy, and released API compatibility.
- `architecture:component-theming-surface` owns the anatomy-to-target disposition and target composition.
- `architecture:component-test-sufficiency` owns bounded, mutation-sensitive evidence for each critical established public seam.

## Verification map

| Contract             | Verification                                                                                  | Representative states                                                           | Mutation or failure expectation                                                                                                                                   | Audit section                    |
| -------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- |
| FR1–FR3, AR1–AR4     | `FieldLabel.test.tsx` plus exact-head axe and Chromium sensor receipts                        | single, group, description, hidden, interactive description child               | Wrong label element, lost association, nested description, missing hidden text, or forwarded group/interactive click fails.                                       | `audit:FieldLabel/accessibility` |
| FR4–FR5, ORD1        | focused DOM tests, i18n catalog checks, and exact-head light/dark/custom-theme frames         | optional, required, both, form default, icon, tooltip, disabled                 | Wrong localized marker, order, visibility, or tokenized state is exposed.                                                                                         | `audit:FieldLabel/behavior`      |
| FR6, ORD2            | BaseProps lint, focused composition tests, theming-target tests, and browser target inventory | class, style, xstyle, data, event, target; with and without description wrapper | Consumer input is dropped, retargeted to the wrapper, or the `field-label` target disappears.                                                                     | `audit:FieldLabel/api`           |
| FR7                  | Public type review against the runtime single-label and group-span branches                   | single label; group span                                                        | Public ref/prop types claim a different label element than runtime.                                                                                               | `audit:FieldLabel/api`           |
| FR8, AR5             | focused source/DOM review plus exact-head sensor receipt for the tooltip anchor               | tooltip absent; tooltip present                                                 | The known anonymous, nonfocusable anchor disappears from the audit record before an accessible path replaces it.                                                  | `audit:FieldLabel/accessibility` |
| Documentation        | docs typecheck, CLI readback, prop-literal/reference tests, and knowledge validation          | every public prop and default                                                   | Docs omit or misstate a public input or default.                                                                                                                  | `audit:FieldLabel/docs`          |
| RTL applicability    | source/story inspection and verified-N/A registry                                             | all component-owned states                                                      | A directional glyph, physical inline property, inline-side placement, order, scroll/drag, inline-side overlay placement, or horizontal arrow key makes N/A stale. | `audit:FieldLabel/i18n-rtl`      |
| Responsive rendering | exact-head 320px Chromium sensor receipts                                                     | visible, hidden, description, group, optionality, icon, tooltip                 | The story overflows horizontally or a visible/hidden label loses its relationship.                                                                                | `audit:FieldLabel/responsive`    |

## Decision log

No component-local decision is asserted. This draft records shipped behavior, retains the objective tooltip-accessibility gap, and leaves the polymorphic label-element/ref contract in OQ1.

## Open questions

- **OQ1 — Should `isGroupLabel` expose a discriminated span-root BaseProps/ref contract, or should FieldLabel use one root element whose public type is stable in both modes?** (`human-api`)

## Content boundary

This draft records verified shipped behavior, the objective tooltip-accessibility gap, and the released label-element type/runtime mismatch. It does not choose a ref migration, add a theme target, duplicate consumer prop tables, or store audit scores and run evidence.
