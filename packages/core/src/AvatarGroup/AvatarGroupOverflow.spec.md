---
schema_version: 3
template_version: 4
kind: component
id: component:AvatarGroupOverflow
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/AvatarGroup/AvatarGroupOverflow.test.tsx,
    packages/core/src/AvatarGroup/AvatarGroup.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/theme/derivedVarRegistry.test.ts,
    apps/storybook/rtl-audit/targets.json,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:knowledge-contracts,
    architecture:component-theming-surface,
    architecture:public-component-api,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# AvatarGroupOverflow component contract

## Intent

AvatarGroupOverflow presents the current compact overflow amount associated with
an AvatarGroup. It renders a default count or caller-supplied content and may use
a native button when the existing activation callback is present. This draft
records verified shipped behavior only. It does not change runtime behavior,
public API, compatibility, targets, or product meaning.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive observational documentation only; runtime, DOM,
  accessibility, styling, targets, defaults, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The overflow indicator element and its current `avatar-group-overflow` theming
  target.
- The current default visible count content and translated accessible count label.
- The current static-element and native-button render branches.
- The standalone presentation fallback used outside AvatarGroup.

**Does not own / non-goals**

- Choosing which avatars are visible or calculating the hidden count; the product
  callsite supplies the count and Avatar children.
- Avatar content, image loading, fallback initials, status, and Avatar theming;
  those remain owned by `component:Avatar` when that contract exists.
- AvatarGroup's group label, context lifetime, child ordering, or roving-focus
  algorithm. AvatarGroupOverflow only participates through the current rendered
  marker when it is interactive.
- Caller-supplied custom child content beyond rendering it in the current slot.
- New API meaning, validation, defaults, compatibility promises, or visual
  treatment.

## Public concepts

Consumer syntax remains in `AvatarGroupOverflow.doc.mjs`. This table records the
current observable concepts rather than duplicating its prop table.

| Concept            | Closed values or states                                | Meaning                                                                                                                            | Availability by variant/orientation/state                       | Default                                             | Owner                                                                                            | Stability                 | Invalid-value behavior                                                                                 |
| ------------------ | ------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------ | ------------------------- | ------------------------------------------------------------------------------------------------------ |
| Overflow amount    | Numeric amount supplied by the caller                  | Drives the current translated accessible label and the default visible `+N` content.                                               | Static and interactive branches; inside or outside AvatarGroup. | Required caller input.                              | `component:AvatarGroupOverflow`                                                                  | Observed released surface | Negative values currently normalize to zero; this draft does not specify other runtime-invalid values. |
| Display content    | Default count content or caller-supplied React content | Selects the visible content inside the indicator without replacing the count-derived accessible label.                             | Both render branches.                                           | Default `+N` content when custom content is absent. | `component:AvatarGroupOverflow` for the default; caller for supplied content                     | Observed released surface | React rendering determines caller-content behavior.                                                    |
| Activation mode    | Static or clickable                                    | Absence of the current callback renders a span; presence renders a native button and invokes the callback on activation.           | Both standalone and grouped use.                                | Static.                                             | `component:AvatarGroupOverflow`                                                                  | Observed released surface | The typed callback boundary accepts a function or is absent.                                           |
| Group presentation | Group-provided or standalone fallback                  | Group context currently supplies size, shape, and overlap; standalone use falls back to medium, circle, and no overlap.            | All current size and shape values; LTR and RTL.                 | Standalone medium circle with zero overlap.         | AvatarGroup context for grouped values; `component:AvatarGroupOverflow` for fallback application | Observed released surface | Type-rejected group values are outside this draft.                                                     |
| DOM extension      | Supported BaseProps inputs and ref                     | Supported DOM, ARIA, data, event, class, style, and StyleX inputs reach the current root; ref reaches the rendered span or button. | Both render branches.                                           | No additional inputs.                               | `architecture:public-component-api`                                                              | Observed released surface | BaseProps omissions remain unsupported.                                                                |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                                                                                                                                   | Basis                                                                    | Draft review state                                                               |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------- |
| FR1 | Without the existing activation callback, the current render uses one span; with the callback, it uses one native `button` with `type="button"` and invokes that callback on native activation.                                                                                                                                                                                                                       | Current source, consumer docs, tests, and rendered evidence              | Verified shipped behavior; no new activation meaning decided                     |
| FR2 | The current rendered amount never displays a negative value: negative input normalizes to zero before both the translated accessible label and default `+N` content are produced. Caller-supplied child content replaces only the visible default content.                                                                                                                                                            | Current source, docs, and tests                                          | Verified shipped behavior; no new validation policy decided                      |
| FR3 | Inside AvatarGroup, the indicator currently consumes the group's resolved size, shape, and overlap. Outside a group, it currently uses the medium size, circle shape, and zero overlap.                                                                                                                                                                                                                               | Current source, tests, stories, and browser evidence                     | Verified shipped behavior; no context contract change                            |
| FR4 | The current root remains at least as wide as the resolved avatar size, grows inline for wider content, keeps the resolved avatar height, and applies overlap only when it is not the first child.                                                                                                                                                                                                                     | Current source and browser evidence                                      | Verified shipped layout; no new geometry requirement introduced                  |
| FR5 | The current root carries the `avatar-group-overflow` target with size and shape reflection, then combines component styles with supported consumer StyleX, class, and style inputs on that same element.                                                                                                                                                                                                              | Current source, docs, target tests, and browser evidence                 | Verified shipped theming and passthrough behavior                                |
| FR6 | An indicator with the current activation callback carries AvatarGroup's item marker and participates in AvatarGroup's existing roving-focus sequence. The static span branch carries no group item marker and is non-interactive by default; supported caller-provided DOM props such as `tabIndex` still reach that span and may make it programmatically or sequentially focusable according to the supplied value. | Current source, BaseProps passthrough, and AvatarGroup interaction tests | Verified composition and passthrough; AvatarGroup retains roving-focus ownership |

### Allowed variation

- **AV1 — Amount and content.** The numeric amount and caller-supplied visible
  content may vary; wider content may grow the indicator inline.
- **AV2 — Group presentation.** Current AvatarGroup size and shape values may vary
  while the indicator continues to consume the group's resolved context.
- **AV3 — Styling inputs.** Supported consumer styling may vary through the current
  BaseProps and `avatar-group-overflow` target without moving the target to a
  different element.

### Representative states

| State                 | Required invariant                                                                                                                                                                                                                                                          | Allowed variation                                                                                                     |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| Static default count  | One span presents the translated count label and visible `+N` content. It is non-interactive by default and remains outside AvatarGroup's roving-focus item set; supported caller DOM props such as `tabIndex` may make the span focusable according to the supplied value. | Count, group size, group shape, direction, supported consumer DOM/styling props, and resulting focusability may vary. |
| Static custom content | The span retains the count-derived accessible label while caller content replaces the visible default. Its default interaction and passthrough behavior match the static count branch.                                                                                      | Caller owns the custom React content; supported consumer DOM and styling props may vary.                              |
| Clickable count       | One native button presents the count-derived accessible label, participates in the group marker when grouped, and invokes the existing callback.                                                                                                                            | Count, content, group presentation, and supported consumer inputs may vary.                                           |
| Negative count        | Accessible and default visible count content use zero rather than a negative value.                                                                                                                                                                                         | Caller-supplied visible content may still differ because it remains caller-owned.                                     |
| Wide count            | The indicator grows inline while retaining its resolved height and content.                                                                                                                                                                                                 | Width follows rendered content and current padding.                                                                   |
| Standalone            | Medium circle and zero-overlap fallbacks apply without AvatarGroup context.                                                                                                                                                                                                 | Count, custom content, activation mode, and consumer styles may vary.                                                 |
| RTL                   | Logical overlap and item order follow the document direction.                                                                                                                                                                                                               | Count, content, size, shape, and activation may vary.                                                                 |

### Transformation and precedence order

- **ORD1 — Resolve presentation.** AvatarGroup context currently supplies size,
  shape, numeric size, and overlap; missing context falls back to medium, circle,
  medium numeric size, and zero overlap.
- **ORD2 — Resolve content.** The numeric input is clamped at zero, then used for
  the translated accessible label; caller children replace only the default visible
  `+N` content.
- **ORD3 — Resolve root.** Callback presence selects the native-button or span
  branch. Component-owned semantics and target data remain on that root, and the
  current merge combines component styles with supported consumer styling inputs.

### Performance and resources

- No new performance or resource constraint is introduced. The observed component
  owns no state, Effect, listener, observer, timer, portal, or asynchronous resource.

## Accessibility contract

- **AR1 — Current accessible count.** Both current render branches expose the
  translator-produced count label derived from the normalized numeric amount.
- **AR2 — Current root semantics.** The activation-callback branch is a native
  `button` with `type="button"` and the shared focus-visible treatment. The static
  branch remains a span and is non-interactive by default; supported caller DOM
  props, including `tabIndex`, are forwarded and may alter its focusability.
- **AR3 — Current group participation.** The activation-callback branch carries
  the current AvatarGroup item marker so AvatarGroup's existing roving-focus owner
  may include it. The static branch carries no such marker even when caller DOM
  props make its span focusable. This draft does not copy or change AvatarGroup's
  focus algorithm.

## Design relationships

| Anatomy or state | Design requirement                                                                      | Representation authority            | Hierarchy role    | Component contract |
| ---------------- | --------------------------------------------------------------------------------------- | ----------------------------------- | ----------------- | ------------------ |
| Count label      | Presents compact supporting count content on the current indicator surface.             | Current source and consumer docs    | Supporting        | FR2, FR4, AR1      |
| Button behavior  | Uses the current native-button branch with shared overlay and focus-visible treatments. | Current source and shared utilities | Supporting action | FR1, FR6, AR2, AR3 |

This observational draft records the current representation and target placement.
It does not decide a new density, proportion, state treatment, or visual default.

## Family and system relationships

- `architecture:knowledge-contracts` owns draft/current authority, observational
  backfill boundaries, exact-head approval, and conflict routing.
- `architecture:component-theming-surface` owns painting-target qualification,
  target capability metadata, and size/shape state reflection on the current
  target.
- `architecture:public-component-api` owns the released subpath, BaseProps
  passthrough, styling composition, ref reachability, and compatibility boundary.
- `spec:AST-002` owns API admission and requires any future public or behavioral
  delta to identify current authority rather than deriving permission from this
  observational draft.
- `spec:AST-029` owns the Night Watch backfill procedure and keeps this draft from
  settling new behavior or changing product meaning.

## Verification map

| Contract                  | Verification                                                                                         | Representative states                                                                                                     | Mutation or failure expectation                                                                                                                                                                        | Audit section                             |
| ------------------------- | ---------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------- |
| FR1, FR2, AR1, AR2        | `AvatarGroupOverflow.test.tsx` render, callback, content, count, ref, passthrough, and locale suites | Static default, static with caller DOM props, clickable, custom content, zero, negative, large, localized, and standalone | Changing the root branch, callback, normalized count, visible fallback, accessible label, supported DOM passthrough, or ref target fails focused public-interface assertions.                          | `audit:AvatarGroupOverflow/behavior`      |
| FR3, FR4                  | `AvatarGroupOverflow.test.tsx`, dedicated stories, and browser evidence                              | Every current size and shape, grouped, standalone, wide count, and narrow viewport                                        | Losing context inheritance, fallbacks, shape reflection, standalone sizing, or wide-content containment fails focused assertions or rendered evidence.                                                 | `audit:AvatarGroupOverflow/layout`        |
| FR5                       | `themingTargets.test.ts`, `derivedVarRegistry.test.ts`, source inspection, and dedicated stories     | Static and interactive roots across sizes and shapes                                                                      | Target metadata, reflected axes, private overlap variable ownership, or painting-root placement drift fails guards or rendered inspection.                                                             | `audit:AvatarGroupOverflow/theming`       |
| FR6, AR3                  | `AvatarGroup.test.tsx` overflow-button roving-focus suite plus source/passthrough inspection         | Activation-callback branch after an interactive Avatar; static span with and without caller `tabIndex`                    | Removing the marker from the callback branch breaks group participation; adding it to the static branch changes the observed roving set; dropping caller `tabIndex` contradicts BaseProps passthrough. | `audit:AvatarGroupOverflow/accessibility` |
| RTL relation              | `apps/storybook/rtl-audit/targets.json` D2 target and `AvatarGroupOverflow.stories.tsx`              | Default grouped overflow in LTR and RTL                                                                                   | Failing to mirror the Avatar-to-overflow order fails component-scoped RTL coverage.                                                                                                                    | `audit:AvatarGroupOverflow/i18n-rtl`      |
| Documentation and surface | `AvatarGroupOverflow.doc.mjs`, block data tests, export checks, and `scripts/check-knowledge.mjs`    | Consumer docs, blocks, package subpath, and this draft                                                                    | Missing or stale docs, exports, required structure, relationships, or anatomy dispositions fail repository validation.                                                                                 | `audit:AvatarGroupOverflow/docs`          |

Current audit scores, screenshots, eligibility, and per-run receipts remain in their
existing wiki, pull-request, and trusted-check owners rather than this contract.

## Decision log

None. This draft records current facts and introduces no component-local API,
behavior, accessibility, layout, theming, or design decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer prop tables or examples, current audit
scores or screenshots, implementation steps, AvatarGroup's focus algorithm, or
shared API, theming, knowledge, and audit-system rules. It links to their owners.
