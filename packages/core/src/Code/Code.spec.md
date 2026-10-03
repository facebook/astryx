---
schema_version: 3
template_version: 6
kind: component
id: component:Code
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, theming, accessibility, visual]
verified_by:
  [
    packages/core/src/Code/Code.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/docPropLiterals.test.ts,
    packages/core/src/docPropReferences.test.ts,
    apps/storybook/stories/Code.stories.tsx,
    apps/storybook/rtl-audit/verified-not-applicable.json,
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

# Code component contract

## Contract at a glance

| Area                    | Contract                                                                                                                                                                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Public contract         | `Code` is exported from `@astryxdesign/core/Code`; it requires `children`, defaults `color` to `primary`, optionally accepts `secondary` or `inherit`, and accepts `size="inherit"`.                                                                    |
| Behavior                | Code renders one semantic `<code>` element, uses the code type scale by default, and may inherit surrounding color or typography through explicit props.                                                                                                |
| End-user impact         | Readers receive recognizable inline code that wraps instead of forcing its prose container wider.                                                                                                                                                       |
| Builder impact          | Builders can discover the complete released API, use Code for short inline references, and use CodeBlock for standalone or multi-line snippets.                                                                                                         |
| Compatibility/readiness | This audit restores missing consumer metadata and records shipped behavior. Runtime, types, defaults, layout, and visible component output are unchanged.                                                                                               |
| Review checks           | Reject a non-`code` root, dropped content or root props, a ref that misses the root, a visual prop not reflected on the `code` target, undocumented released props/defaults, or a change that turns the inline component into a block-code replacement. |
| Governing rules         | `architecture:public-component-api/INV1,INV5,INV6,INV8–INV9`; `architecture:component-theming-surface/INV3–INV7`; `architecture:component-test-sufficiency/INV1–INV7,INV10–INV11`.                                                                      |

This table is a review projection; the body below is authoritative only after owner approval.

## Intent

Present short technical references inside prose with native code semantics and a compact, themeable inline treatment.

## Compatibility and migration

- Released default preserved: yes
- Compatibility class: documentation and ownership restoration only; no runtime, type, default, style, target, or export change
- Controlled/uncontrolled behavior: not applicable; Code owns no state
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The semantic inline-code root, code typography and wrapping, primary/secondary/inherited text color, optional inherited size, supported root props and ref, and the `code` theme target.

**Does not own / non-goals**

- Syntax highlighting, line numbers, copy behavior, titles, fenced or multi-line presentation — owned by `component:CodeBlock`.
- The meaning, localization, or bidirectional ordering of caller-supplied code content — owned by the product callsite and platform text engine.
- An interactive action or navigation contract — builders compose the appropriate Button or Link outside Code.

## Public concepts

| Concept      | Closed values or states           | Meaning                                                                         | Availability | Default    | Owner            | Stability | Invalid-value behavior      |
| ------------ | --------------------------------- | ------------------------------------------------------------------------------- | ------------ | ---------- | ---------------- | --------- | --------------------------- |
| color        | `primary`, `secondary`, `inherit` | Selects the inline code text color source.                                      | Every render | `primary`  | `component:Code` | stable    | rejected by the public type |
| size         | code scale, inherited             | Uses the code type scale when omitted or surrounding typography when inherited. | Every render | code scale | `component:Code` | stable    | rejected by the public type |
| code content | caller-supplied React content     | Supplies the content inside the semantic code element.                          | Every render | required   | product callsite | stable    | ordinary React rendering    |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                          | Basis                                                                                   | Draft review state |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------ |
| FR1 | Code MUST render one semantic `<code>` root containing the caller content.                                                                                                                   | shipped source, tests, docs, and HTML semantics                                         | verify             |
| FR2 | Omitting `size` MUST use the code type-scale size; `size="inherit"` MUST inherit the surrounding font size and line height. `color` MUST select primary, secondary, or inherited text color. | shipped public types, source, tests, and stories                                        | verify             |
| FR3 | Long inline content MUST remain wrap-capable, and Code MUST add only logical inline/block padding rather than physical-direction geometry.                                                   | shipped source and representative prose stories                                         | verify             |
| FR4 | Supported DOM props, `className`, `style`, and `xstyle` MUST compose on the root, and the public ref MUST reach that root.                                                                   | `architecture:public-component-api/INV5,INV6,INV8`; shipped source and tests            | verify             |
| FR5 | The painted root MUST retain the public `code` target and reflect the `color` visual axis. No internal target or separate state target is part of the shipped surface.                       | `architecture:component-theming-surface/INV3–INV7`; source and theming-target inventory | verify             |

### Allowed variation

- **AV1 — Theme paint.** The `code` target may vary supported typography, color, background, padding, radius, and other accepted paint without changing semantic content or inline ownership.
- **AV2 — Caller content.** Code content may contain any React content accepted by the released `children` type; its meaning remains caller-owned.
- **AV3 — Surrounding typography.** Builders may explicitly inherit surrounding color or size; omission preserves the component defaults.

### Representative states

| State               | Required invariant                                                 | Allowed variation                          |
| ------------------- | ------------------------------------------------------------------ | ------------------------------------------ |
| default             | Semantic code root, primary color, code type-scale size.           | Caller content and theme paint.            |
| secondary color     | Same root and layout with the secondary text-color source.         | Caller content and theme paint.            |
| inherited color     | Same root and layout with surrounding text color.                  | Surrounding color and caller content.      |
| inherited size      | Same root and paint with surrounding font size and line height.    | Surrounding typography and caller content. |
| long inline content | Content wraps without component-owned physical-direction geometry. | Break opportunities in caller content.     |

### Transformation and precedence order

- **ORD1 — Root props.** Supported caller DOM props → component target and visual-axis reflection → base/color/size/xstyle classes → consumer class and inline style composition.
- **ORD2 — Typography.** Omitted size → code type-scale size; explicit `inherit` → surrounding font size and line height.

### Performance and resources

- **PR1 — Pure render.** Code owns no state, Effect, listener, observer, timer, external resource, or asynchronous work.

## Accessibility contract

- **AR1 — Native semantics.** The root remains a semantic `<code>` element and adds no interactive role, focus target, or component-authored accessible name.
- **AR2 — Caller content.** The caller-supplied content remains the accessible content; Code does not translate, hide, or duplicate it.

## Design relationships

| Anatomy or state | Design requirement                                                                           | Representation authority        | Hierarchy role           | Component contract |
| ---------------- | -------------------------------------------------------------------------------------------- | ------------------------------- | ------------------------ | ------------------ |
| Container        | Distinguishes short technical text through code typography and compact background treatment. | observed shipped representation | inline technical content | FR1–FR5, AR1–AR2   |

No current design record prescribes exact Code pixels. This observational draft records the shipped representation without promoting draft typography guidance.

### Theming anatomy

<!-- anatomy-theming:v1 -->

```json
{
  "Container": {"target": "code"}
}
```

## Family and system relationships

- `architecture:public-component-api` owns export reachability, accepted root props, styling composition, ref reachability, released defaults, and consumer documentation.
- `architecture:component-theming-surface` owns target qualification, target placement, visual-axis reflection, and metadata ownership.
- `architecture:component-test-sufficiency` owns the rational evidence set and rejects component functional tests for documentation-only corrections when shared schema and projection checks are the capable layer.

## Verification map

| Contract          | Verification                                                                                        | Representative states                                  | Mutation or failure expectation                                                                                                 | Audit section           |
| ----------------- | --------------------------------------------------------------------------------------------------- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------- |
| FR1, AR1–AR2      | `Code.test.tsx`; semantic review of the Storybook fixtures                                          | default and prose composition                          | The root stops being a code element, content disappears, or the component invents interaction or accessible naming.             | `audit:Code/a11y`       |
| FR2               | `Code.test.tsx`; `Code.stories.tsx`; exact-head stable visual regression                            | primary, secondary, inherited color, inherited size    | A color choice stops reaching the target or inherited typography becomes visually indistinguishable from the fixed default.     | `audit:Code/behavior`   |
| FR3               | `Code.stories.tsx`; exact-head Storybook, visual, and browser gates                                 | paragraph, instructional content, varied content       | Inline code forces physical-direction geometry or no longer wraps in constrained prose.                                         | `audit:Code/responsive` |
| FR4               | `Code.test.tsx`; strict type/lint validation                                                        | ref plus supported styling and DOM passthrough         | The ref misses the root or supported consumer inputs stop composing on it.                                                      | `audit:Code/api`        |
| FR5               | `themingTargets.test.ts`; Code consumer docs; source review                                         | every color value                                      | The target disappears or moves off the painter, color is no longer reflected, or metadata assigns the target to another owner.  | `audit:Code/theming`    |
| RTL N/A           | `verified-not-applicable.json`                                                                      | every current story                                    | Directional glyph, physical inline placement, ordering, scrolling, overlay, or horizontal keyboard behavior appears unmeasured. | `audit:Code/rtl`        |
| Consumer metadata | CLI `component Code --json`; docs typecheck; `docPropLiterals.test.ts`; `docPropReferences.test.ts` | required content, color values/default, inherited size | A released prop/default/target disappears from consumer discovery or docs name a value the source does not accept.              | `audit:Code/docs`       |

## Decision log

None. This audit restores missing consumer metadata and records shipped behavior; it makes no new product decision.

## Open questions

None. This observational draft does not decide exact visual tuning or broaden Code into a block-code component.

## Content boundary

This file does not duplicate consumer examples, current audit scores, implementation steps, CodeBlock behavior, or draft typography policy. It links to their owners.
