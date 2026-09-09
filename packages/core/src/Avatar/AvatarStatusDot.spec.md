---
schema_version: 3
template_version: 4
kind: component
id: component:AvatarStatusDot
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
owners: [cixzhang]
review_triggers: [public-api, behavior, layout, theming, accessibility]
verified_by:
  [
    packages/core/src/Avatar/AvatarStatusDot.test.tsx,
    packages/core/src/Avatar/Avatar.test.tsx,
    packages/core/src/theme/themingTargets.test.ts,
    packages/core/src/theme/extensibleAxes.test.ts,
    apps/storybook/stories/AvatarStatusDot.stories.tsx,
    scripts/check-knowledge.mjs,
  ]
modules: []
families: []
design_specs: []
architecture:
  [
    architecture:knowledge-contracts,
    architecture:component-theming-surface,
    architecture:component-style-authoring,
    architecture:public-component-api,
    architecture:theme-tokens,
  ]
contributing: []
system_specs: [spec:AST-002, spec:AST-029]
---

# AvatarStatusDot component contract

## Intent

AvatarStatusDot renders the compact status indicator currently composed through
Avatar's `status` slot. This draft records verified shipped behavior only. It does
not change runtime behavior, public API, compatibility, target names, defaults, or
visual meaning.

## Compatibility and migration

- Released default preserved: `yes`
- Compatibility class: additive observational documentation and story coverage;
  runtime behavior, DOM, targets, defaults, and public API remain unchanged
- Controlled/uncontrolled behavior: not applicable
- Migration decision: none

Consumer migration instructions belong in consumer docs and release notes.

## Ownership boundary

**Owns**

- The painted status-dot root and its current `avatar-status-dot` target.
- The current built-in filled, ring, and minus visual branches.
- Current size-tier resolution from Avatar's resolved numeric size.
- Reporting its optional status label into Avatar's accessible name.

**Does not own / non-goals**

- Avatar identity, image fallback, shape, status placement, or interactive behavior;
  those remain with `component:Avatar` when that contract exists.
- The meaning or artwork of caller-supplied icon content.
- A new status vocabulary, visual default, or compatibility promise.

## Public concepts

Consumer syntax remains in `AvatarStatusDot.doc.mjs`. The table records current
observable concepts rather than replacing that prop reference.

| Concept        | Closed values or states                                                               | Meaning                                                             | Availability by variant/orientation/state | Default               | Owner                                                                                  | Stability                 | Invalid-value behavior                                                                                                               |
| -------------- | ------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------------- | --------------------- | -------------------------------------------------------------------------------------- | ------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| Status variant | Built-ins `success`, `neutral`, `error`; the released map also admits augmented names | Selects the current plate color and built-in non-color mark.        | All size tiers; LTR and RTL.              | `success`             | `component:AvatarStatusDot` for built-ins; the unmatched augmented path is legacy debt | Observed released surface | An augmented name with no matching built-in rule keeps root geometry and `data-variant` but has no reliable color-and-icon fallback. |
| Status label   | String or absent                                                                      | Names a standalone dot and is reported into the owning Avatar name. | Every variant and size.                   | Absent                | Caller supplies meaning; component exposes and reports it                              | Observed released surface | Empty or absent label emits no role or accessible name on the dot and reports no status name.                                        |
| Custom icon    | Renderable React content or absent                                                    | Replaces the built-in glyph where the current size tier has room.   | Medium and large tiers; hidden on small.  | Absent                | Caller owns artwork; component owns placement and suppression rules                    | Observed released surface | Booleans and empty strings are ignored; a component that renders no DOM still suppresses the built-in glyph.                         |
| DOM extension  | Supported BaseProps inputs and ref                                                    | Extends the current root and combines consumer styles.              | Every render branch.                      | No additional inputs. | `architecture:public-component-api`                                                    | Observed released surface | BaseProps omissions remain unsupported.                                                                                              |

## Behavioral and layout contract

| ID  | Candidate invariant                                                                                                                                                                                                                                                                                               | Basis                                                                                                      | Draft review state                                                                           |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| FR1 | Avatar sizes up to 36px currently resolve a 10px dot with 1px border and no custom icon; 40–72px resolve 20px/2px/12px; 96px and above resolve 32px/4px/18px. Standalone use reads AvatarSizeContext's current 36px default.                                                                                      | Current source, tests, stories, and browser evidence                                                       | Verified shipped geometry; no new threshold or size meaning decided                          |
| FR2 | `success` currently paints a filled semantic-success plate without an inner glyph; `neutral` paints a surface plate with a ring; `error` paints a semantic-error plate with a minus.                                                                                                                              | Current source, tests, consumer docs, and rendered evidence                                                | Verified built-in behavior; no new status vocabulary decided                                 |
| FR3 | At medium and large tiers, renderable `icon` content replaces the built-in glyph and is centered in an assistive-technology-hidden wrapper. At the small tier the icon is omitted and the built-in glyph branch remains.                                                                                          | Current source, tests, and rendered evidence                                                               | Verified shipped behavior; icon meaning remains caller-owned                                 |
| FR4 | A non-empty `label` currently adds `role="img"` and `aria-label` to the dot. The callback ref reports the same label through AvatarStatusLabelContext before paint and withdraws it on detach.                                                                                                                    | Current source and Avatar integration tests                                                                | Verified shipped behavior; this audit does not alter requiredness                            |
| FR5 | The root currently carries `avatar-status-dot` with `variant`; ring and minus SVGs carry `avatar-status-dot-glyph` with `shape`. Supported consumer styling and ref inputs reach the root.                                                                                                                        | Current source, docs, target tests, and ref/passthrough inspection                                         | Verified shipped theming and DOM surface                                                     |
| FR6 | The released `AvatarStatusDotVariantMap` currently admits augmented names. For an unmatched name, root geometry and reflected `data-variant` remain while built-in fill, ink, and glyph are absent. The current surface provides no reliable caller-configurable path that supplies both color and icon fallback. | Current source, docs, focused test, `architecture:component-theming-surface/INV14`, and owner confirmation | Pre-existing current-authority conformance gap; this audit records but does not remediate it |

### Allowed variation

- **AV1 — Identity and meaning.** The status label and caller icon artwork may vary.
- **AV2 — Theme output.** Current targets and reflected axes may vary through the
  public theming system without moving target ownership.
- **AV3 — Consumer styling.** Supported BaseProps inputs may vary on the current
  root while component-owned size and reporting behavior remain.

### Representative states

| State                  | Required invariant                                                                                        | Allowed variation                                                                         |
| ---------------------- | --------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| Built-in variants      | Current fill/ring/minus branches and reflected `variant` remain.                                          | Label, Avatar content, size, theme, and direction may vary.                               |
| Small tier             | Dot and built-in shape remain; custom icon is omitted.                                                    | Built-in variant and label may vary.                                                      |
| Medium and large tiers | Current dimensions apply; renderable custom icon replaces the glyph.                                      | Icon artwork, variant, label, and theme may vary.                                         |
| Labelled               | Dot exposes its label and reports it to Avatar.                                                           | The caller-authored label may vary.                                                       |
| Unlabelled             | Dot has no current role/name and reports no status label.                                                 | Visual variant and icon may still render.                                                 |
| Augmented variant      | Root geometry and reflected `data-variant` render; unmatched built-in fill, ink, and glyph remain absent. | The current released surface has no reliable fallback path supplying both color and icon. |
| RTL                    | Dot content is direction-neutral; Avatar owns logical corner placement.                                   | Theme, variant, size, label, and icon may vary.                                           |

### Transformation and precedence order

- **ORD1 — Resolve size.** Read AvatarSizeContext, then select the current discrete
  size tier and dimensions.
- **ORD2 — Resolve mark.** A renderable icon wins when the tier permits it;
  otherwise the built-in variant glyph is selected when one exists.
- **ORD3 — Resolve root.** Component target/style output is combined with supported
  consumer StyleX, class, and style inputs on the current root.

### Performance and resources

- **PR1 — Commit-phase label reporting.** The current callback-ref path reports and
  withdraws the label without adding a state mirror, Effect, observer, listener,
  timer, or second render.

## Accessibility contract

- **AR1 — Current accessible name.** A non-empty `label` names a standalone dot and
  is composed into Avatar's name through the current context report.
- **AR2 — Decorative visual marks.** The built-in SVG and custom-icon wrapper are
  hidden from assistive technology because the root or Avatar name carries status.
- **AR3 — Current built-in non-color cues.** The three built-in variants use filled,
  ring, and minus topologies in addition to semantic color. Replacing that mark with
  caller content may change the non-color distinction; this draft records rather
  than resolves that public seam.

## Design relationships

| Anatomy or state | Design requirement                                             | Representation authority                                             | Hierarchy role             | Component contract |
| ---------------- | -------------------------------------------------------------- | -------------------------------------------------------------------- | -------------------------- | ------------------ |
| Status-dot root  | Compact semantic-status plate on Avatar's edge.                | Current source and consumer docs; no current component design record | Supporting indicator       | FR1, FR2, FR5      |
| Built-in glyph   | Ring or minus supplements color for neutral/error.             | WCAG 2.2 SC 1.4.1 plus current shipped representation                | Meaningful non-text cue    | FR2, AR3           |
| Custom icon      | Caller artwork replaces the built-in mark where space permits. | Caller owns artwork; current source owns placement                   | Conditional meaningful cue | FR3, AR2, AR3      |

This observational draft does not select new glyphs, proportions, density, status
semantics, or prominence treatment.

## Family and system relationships

- `architecture:knowledge-contracts` owns draft/current authority, conflict routing,
  and observational-record boundaries.
- `architecture:component-theming-surface` owns painting-target qualification,
  reflected axes, and the reliable theme-independent fallback required for an
  extensible visual axis. This audit records the current violation and leaves the
  public surface unchanged.
- `architecture:component-style-authoring` owns StyleX lowering and permits the
  component-owned non-glyph SVG shapes used here.
- `architecture:public-component-api` owns the released subpath, BaseProps
  passthrough, styling composition, ref reachability, and compatibility boundary.
- `architecture:theme-tokens` owns the semantic color and radius vocabulary.
- `spec:AST-002` owns API admission and requires future public behavior or default
  changes to identify current authority.
- `spec:AST-029` owns this Night Watch observational backfill and keeps it from
  settling new product meaning.

## Verification map

| Contract                  | Verification                                                                               | Representative states                                                | Mutation or failure expectation                                                                                               | Audit section                         |
| ------------------------- | ------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| FR1–FR3, AR2, AR3         | `AvatarStatusDot.test.tsx` plus dedicated Storybook browser matrix                         | Three size tiers, three built-ins, custom icon present/absent        | Size-tier, mark-selection, hidden-icon, or built-in-shape drift fails focused assertions or rendered receipts.                | `audit:AvatarStatusDot/behavior`      |
| FR4, AR1                  | `Avatar.test.tsx` status-name suites and `AvatarStatusDot.test.tsx`                        | Direct/wrapped/changing/removed labels; labelled and unlabelled dots | Losing the standalone or composed status name, commit-phase update, or cleanup fails role/name assertions.                    | `audit:AvatarStatusDot/accessibility` |
| FR5                       | Theming target and extensible-axis tests plus source inspection                            | Built-in and augmented variants, glyph ring/minus, consumer styling  | Missing target metadata/reflection, target movement, or dropped supported DOM/style inputs fails checks or inspection.        | `audit:AvatarStatusDot/theming`       |
| FR6                       | Focused augmented-variant unit test and source/docs inspection                             | Augmented name without a matching built-in rule                      | The base-only output remains visible while the missing reliable color-and-icon fallback stays recorded as pre-existing debt.  | `audit:AvatarStatusDot/api`           |
| RTL relation              | Dedicated RTL audit coverage and receipted LTR/RTL browser frames                          | Built-ins across current sizes                                       | New directional glyph, physical positioning, or unmatched transform produces a coverage or render difference.                 | `audit:AvatarStatusDot/i18n-rtl`      |
| Documentation and surface | Consumer docs, blocks, dedicated stories, export checks, and `scripts/check-knowledge.mjs` | Props, package subpath, blocks, story states, and this draft         | Missing/stale docs, exports, required structure, relationships, or story coverage fail repository checks or audit inspection. | `audit:AvatarStatusDot/docs`          |

## Decision log

None. This draft records current facts and introduces no component-local API,
behavior, accessibility, layout, theming, or design decision.

## Open questions

None.

## Content boundary

This file does not duplicate consumer examples, current audit scores, screenshots,
run inventories, eligibility data, or shared API/theming rules. It links to their
owners.
