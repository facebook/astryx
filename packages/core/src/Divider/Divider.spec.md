---
schema_version: 3
template_version: 7
kind: component
id: component:Divider
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility, testing]
verified_by:
  [
    packages/core/src/Divider/Divider.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    apps/storybook/stories/Divider.stories.tsx,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:public-component-api,
    architecture:component-theming-surface,
    architecture:container-padding,
    architecture:component-test-sufficiency,
  ]
contributing: []
system_specs: [spec:AST-020, spec:AST-029]
---

# Divider component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `orientation`, `label`, theme-extensible `variant`, `isFullBleed`, `BaseProps<HTMLDivElement>`, and a root `ref`.                                                                                                             |
| Behavior                | The separator renders one rule without a label and two rules around a renderable label; full bleed consumes inherited logical container inset. The theme-extensible variant axis has no settled no-match line-paint fallback. |
| End-user impact         | People can perceive a named separator across horizontal, vertical, labelled, full-bleed, narrow, and RTL compositions. A custom theme variant can still lose its line paint; OQ2 records that retained gap.                   |
| Builder impact          | No new caller choice. Numeric zero remains a valid label; booleans and empty strings leave one continuous unnamed rule.                                                                                                       |
| Compatibility/readiness | Patch-compatible observational contract. Public props, defaults, target names, and built-in appearances remain unchanged; authority stays `draft` until exact-head owner approval.                                            |
| Review checks           | Reject missing numeric labels, physical-edge bleed, dropped root inputs, or a target/axis that disagrees with the rendered separator. Keep the custom-variant paint gap unresolved until OQ2 is settled.                      |
| Governing rules         | `architecture:public-component-api/INV1,INV5–INV9`; `architecture:component-theming-surface/INV3–INV7,INV14`; `architecture:container-padding/INV1,INV3,INV7–INV10`; WCAG 2.2 SC 1.3.1 and 4.1.2 through `spec:AST-020/FR1`.  |

This table is a review projection; the body below is authoritative.

## Intent

Divider provides a programmatic and visual separator between caller-owned content
regions. It owns orientation, line weight, optional label placement and naming,
logical full-bleed geometry, and the aggregate `divider` theme target. The caller
owns the meaning of the surrounding regions.

Consumer syntax and examples belong in `Divider.doc.mjs`.

## Compatibility and migration

- Released default preserved: yes — horizontal, subtle, unlabelled, and not full
  bleed.
- Compatibility class: patch fix. ReactNode values that React renders, including
  numeric zero, stay inside the label wrapper; skipped scalar labels leave one
  continuous unnamed rule.
- Controlled/uncontrolled behavior: not applicable.
- Migration decision: none.

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- One semantic separator root and its public ref, DOM, data, ARIA, class, style,
  event, and `xstyle` composition.
- Horizontal and vertical rule geometry.
- Optional label placement and the separator naming relationship.
- Built-in subtle and strong line weights.
- The current reflected custom-variant state, including the missing deterministic
  line-paint fallback recorded by OQ2.
- Logical full-bleed consumption of inherited container inset.
- The aggregate `divider` target with reflected orientation and variant axes.

**Does not own / non-goals**

- The meaning or heading structure of surrounding content regions — owned by the
  product callsite.
- Container inset publication — owned by `architecture:container-padding`.
- A separate public target for Rule or Label — unresolved under OQ1.
- Theme-authored custom variant paint and the public part that should own it —
  unresolved under OQ2.

## Public concepts

| Concept      | Closed values or states                       | Meaning                                                                                       | Availability by variant/orientation/state | Default      | Owner                        | Stability                               | Invalid-value behavior                                                             |
| ------------ | --------------------------------------------- | --------------------------------------------------------------------------------------------- | ----------------------------------------- | ------------ | ---------------------------- | --------------------------------------- | ---------------------------------------------------------------------------------- |
| Orientation  | `horizontal`; `vertical`                      | Selects the separator axis, rule geometry, and `aria-orientation`.                            | Every divider                             | `horizontal` | component                    | stable                                  | Closed union; rejected by types                                                    |
| Label        | renderable ReactNode; omitted/skipped scalar  | Inserts one label between two rules and names the separator unless explicit ARIA naming wins. | Every orientation and variant             | omitted      | caller/component             | stable                                  | `null`, booleans, and empty strings render no label; numeric zero remains visible  |
| Variant      | `subtle`; `strong`; theme-added visual values | Selects line paint and reflects the requested value on the target.                            | Every orientation and label state         | `subtle`     | component/theme              | stable built-ins; theme-extensible axis | An unmatched custom value has no deterministic line-paint baseline; see OQ2        |
| Full bleed   | false; true                                   | Consumes inherited logical container inset on the divider axis.                               | Every orientation                         | false        | component/container protocol | stable                                  | Missing variables resolve to zero                                                  |
| Root surface | ref; DOM/data/ARIA; class/style/xstyle/events | Extends the semantic separator root.                                                          | Every divider                             | omitted      | public component API         | stable                                  | Accepted inputs compose; component-owned role and orientation remain authoritative |

## Behavioral and layout contract

Draft requirements identify their basis so observed code is not mistaken for an
intentional decision.

| ID  | Candidate invariant                                                                                                                                                                                                              | Basis                                                                                  | Draft review state              |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- | ------------------------------- |
| FR1 | The divider MUST render one rule without a renderable label and two rules with the label between them. Numeric zero MUST remain a renderable label.                                                                              | Released ReactNode API; current source/docs; `architecture:public-component-api/INV9`  | verify                          |
| FR2 | The root MUST expose `role="separator"` and the selected `aria-orientation`. A renderable label MUST name it through `aria-labelledby` unless an explicit caller `aria-label` or `aria-labelledby` wins.                         | WCAG 2.2 SC 1.3.1 and 4.1.2; current source/tests                                      | verify                          |
| FR3 | Built-in variants MUST paint subtle or strong lines. The exported map accepts theme-added values, but an unmatched value currently leaves the inner rule without line paint; the correct fallback/target ownership requires OQ2. | `architecture:component-theming-surface/INV4,INV6,INV14`; exported `DividerVariantMap` | human decision; open BLOCK      |
| FR4 | Full bleed MUST consume inherited logical inline inset for horizontal dividers and logical block inset for vertical dividers; absent inset MUST resolve to zero.                                                                 | `architecture:container-padding/INV1,INV3,INV7–INV10`                                  | verify                          |
| FR5 | The root MUST carry the `divider` target and reflect orientation and requested variant. Rule and Label currently carry no public target.                                                                                         | `architecture:component-theming-surface/INV3–INV6`; current metadata                   | verify; part exposure unsettled |
| FR6 | Accepted ref, DOM/data/ARIA, class, style, events, and `xstyle` MUST reach or compose on the separator root without replacing component-owned role or orientation.                                                               | `architecture:public-component-api/INV5–INV8`                                          | verify                          |

### Allowed variation

- **AV1 — Label content.** Any caller-owned ReactNode that React renders may fill
  the label wrapper.
- **AV2 — Theme paint.** An active theme may restyle the aggregate target and its
  variant axis. OQ2 owns the unresolved inner-rule paint and fallback boundary.
- **AV3 — Container geometry.** Full bleed follows the inherited per-edge inset,
  including asymmetric and zero values.

### Representative states

| State                               | Required invariant                                                                      | Allowed variation                          |
| ----------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------ |
| Unlabelled horizontal               | One subtle or strong inline rule; horizontal separator semantics                        | Container width and theme paint            |
| Labelled horizontal                 | Two rules around one visible, naming label                                              | Any renderable label content               |
| Numeric zero label                  | One visible `0` inside the label wrapper; separator name `0`                            | Any orientation or variant                 |
| Vertical labelled/unlabelled        | Block-axis rules and vertical separator semantics                                       | Container height and label content         |
| Theme-added variant without a match | Requested variant reflected; inner rule has no component-owned paint (open BLOCK)       | Custom variant name                        |
| Full bleed                          | Logical-axis inset consumed without physical-direction assumptions                      | Uniform, asymmetric, zero, or absent inset |
| RTL                                 | Horizontal geometry remains logical; full bleed consumes inline start/end independently | Surrounding content and label language     |

### Transformation and precedence order

- **ORD1 — Label presence.** Apply the shared renderable-value predicate; when a
  label remains, render and reference one wrapper between two rules.
- **ORD2 — Accessible name.** Explicit `aria-labelledby` wins, then explicit
  `aria-label`, then the rendered label wrapper; an unlabelled separator stays
  unnamed.
- **ORD3 — Variant paint.** Reflect the requested value on the root target. Built-in
  values select subtle or strong inner-rule paint; unmatched custom values select no
  inner-rule paint pending OQ2.

### Performance and resources

- **PR1 — No external lifecycle.** Divider installs no listener, observer, timer,
  request, state machine, or Effect.

## Accessibility contract

- **AR1 — Programmatic separator.** The root exposes separator role and the exact
  visual orientation.
- **AR2 — Label relationship.** A rendered label names the separator unless the
  caller supplies an explicit accessible name relationship.
- **AR3 — Decorative rule segments.** Internal rule elements add no separate role,
  name, focus target, or interaction.

## Design relationships

| Anatomy or state | Design requirement                                                                            | Representation authority                                     | Hierarchy role | Component contract |
| ---------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------ | -------------- | ------------------ |
| Divider group    | Arrange rule segments and the optional label on one logical axis.                             | observed; container geometry settled by current architecture | supporting     | FR1, FR4           |
| Rule             | Paint a visible subtle or strong separation line; theme-added values lack a settled fallback. | built-ins observed; custom fallback unsettled                | supporting     | FR3                |
| Label            | Present optional content between two rules using supporting text tokens.                      | observed; separate target exposure unsettled                 | prominent      | FR1–FR2            |

No component-local visual decision is settled by this draft.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Divider group": {"target": "divider"},
  "Rule": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  },
  "Label": {
    "none": {
      "reason": "unsettled: No current public target reaches this part"
    }
  }
}
```

The two `none` dispositions record current reachability while target exposure
remains unsettled. They do not decide that Rule or Label should remain without
public targets.

## Family and system relationships

- `architecture:container-padding` owns the inherited internal inset protocol;
  Divider consumes it only through `isFullBleed`.
- `architecture:component-theming-surface` owns the aggregate target, reflected
  axes, anatomy qualification, and the requirement that an open visual axis have
  a deterministic fallback. Divider's current custom-value path does not satisfy
  that requirement; OQ2 keeps remediation out of this objective audit patch.
- `architecture:public-component-api` owns root composition, ref behavior, and
  compatibility of the released ReactNode label surface.
- There is no current Divider family or design record.
- `spec:AST-029` keeps this observational draft separate from the audit receipt.

## Verification map

| Contract         | Verification                                                     | Representative states                                                | Mutation or failure expectation                                                                             | Audit section             |
| ---------------- | ---------------------------------------------------------------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ------------------------- |
| FR1–FR2, AR1–AR3 | `Divider.test.tsx`; component-owned Storybook states; scoped axe | labelled/unlabelled, numeric zero, explicit names, both orientations | Truthiness renders zero outside wrappers or leaves the separator unnamed; role/orientation/name drift fails | `audit:Divider/§1,§4`     |
| FR3              | Source review; global extensible-axis structural guard           | subtle, strong, unmatched theme-added value                          | The current unmatched path leaves the rule unpainted; no Divider-specific browser fallback proof exists     | `audit:Divider/§2`        |
| FR4              | Source review; horizontal and vertical full-bleed stories        | inline/block, LTR/RTL logical properties, absent inset               | A physical property or wrong axis consumes unrelated container geometry                                     | `audit:Divider/§5,§9,§10` |
| FR5              | `themingTargets.test.ts`; component metadata; spec anatomy map   | both orientations and variants                                       | Target/axis/anatomy metadata disagrees with runtime reflection                                              | `audit:Divider/§2`        |
| FR6              | `Divider.test.tsx`; lint, typecheck, and source review           | ref, DOM/data/ARIA, class/style/xstyle/events                        | An accepted input is dropped or component-owned semantics are overwritten                                   | `audit:Divider/§3`        |
| PR1              | Source review                                                    | every state                                                          | A lifecycle mechanism appears without a resource contract                                                   | `audit:Divider/§7`        |

## Decision log

None. This draft records current facts and introduces no component-local design
or theming decision.

## Open questions

- **OQ1 — Should Rule or Label gain stable public theming targets?** (`human-api`)
  Their target exposure is unsettled; the current lack of reachability does not
  decide the answer.
- **OQ2 — Should the open `variant` axis close, or which painting part owns its
  deterministic custom-value fallback?** (`human-api`) The root target can carry
  theme paint while the inner rule carries built-in paint. Applying a subtle inner
  fallback can cover an existing root background; keeping the current path can make
  the rule disappear. Current authority requires a safe fallback but does not choose
  between closing the axis, moving target ownership, or routing paint through a
  reviewed public property.

## Content boundary

This file does not duplicate consumer prop tables/examples, current audit scores,
screenshot matrices, implementation steps, or system rules. The audit pull request
owns the closed run evidence required by `spec:AST-029/FR5`.
