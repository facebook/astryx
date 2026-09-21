---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-037
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [cixzhang]
affects_architecture:
  [architecture:theme-tokens, architecture:component-style-authoring]
affects_families: []
affects_contributing: []
affects_consumer_docs: [theme, tokens]
---

# Portable backdrop blur role system spec

> **Proposal status:** This draft proposes one addition to Astryx's frozen
> portable token vocabulary. It is not current authority and does not authorize
> implementation. Promotion requires explicit approval from the owner above.

## Intent

People opening a blocking top-layer surface should get the same subtle separation
from the page behind it across Astryx components and themes. Theme and component
authors should have one semantic role for that treatment instead of repeating the
same literal.

This proposal adds exactly one portable global token:

```css
--blur-backdrop: 2px;
```

`--blur-backdrop` means **the blur applied to page content behind a top-layer
blocking surface**. It is a semantic role, not a general blur primitive.

## Evidence and admission threshold

Current public Core source has three independent components with the same
observable role and exact value:

| Component   | Blocking surface          | Current treatment                                    |
| ----------- | ------------------------- | ---------------------------------------------------- |
| `Dialog`    | modal `dialog` backdrop   | page content behind `::backdrop` is blurred by `2px` |
| `Lightbox`  | modal `dialog` backdrop   | page content behind `::backdrop` is blurred by `2px` |
| `MobileNav` | modal navigation backdrop | page content behind `::backdrop` is blurred by `2px` |

Three maintained Core components independently expressing the same semantic role
with the same value are enough to consider one portable token. This is stronger
evidence than one product preference or two coincidentally equal literals: it
shows a repeated system-level decision across distinct blocking surfaces.

The evidence supports only this one role and default. It does not support a blur
scale or any broader effect vocabulary.

## Non-goals

- Glass, frosted-glass, acrylic, material, or translucent-surface effects.
- Blur on the surface itself or on content inside the surface.
- Non-blocking popovers, menus, tooltips, teaching surfaces, sticky chrome, or
  other content that leaves the page interactive.
- Entrance, exit, cross-fade, zoom, or other motion effects.
- Edge fades, masks, gradients, or scroll-overflow affordances.
- A numeric blur scale, named intensity ladder, arbitrary blur helper, or utility
  classes.
- Opacity, scrim color, overlay color, or any other backdrop token.
- Application-specific `3px`, `4px`, `6px`, `8px`, or `24px` effects.
- Migrating a literal merely because it also happens to equal `2px`; the rendered
  role must match this contract.
- Changing component behavior, styling, generated output, or token declarations
  in this specification pull request.

## Requirements

- **FR1 — One exact portable role.** If approved, Astryx MUST add exactly one
  portable global token named `--blur-backdrop` with a default value of `2px`.
  No companion minimum, maximum, light, dark, intensity, or numeric-step token is
  part of this contract.
- **FR2 — The semantic boundary is blocking page backdrops.** Core components MAY
  consume the token only as the blur radius for page content behind a surface
  that is both in the browser top layer and blocking interaction with the page
  beneath it. Matching values outside that role MUST NOT be migrated to this
  token.
- **FR3 — Scrim and blur keep separate responsibilities.** The existing backdrop
  color remains the primary blocking and contrast treatment. `--blur-backdrop`
  controls only blur and MUST NOT absorb opacity, color, translucency, or surface
  material semantics.
- **FR4 — Themes may vary the role without changing its meaning.** Existing
  portable-token authoring and projection paths MAY override the length while the
  role remains “page content behind a top-layer blocking surface.” An override
  MUST NOT reinterpret the token as a general blur or material effect.
- **FR5 — Default adoption is visually compatible.** Migrating the three current
  Core consumers MUST preserve their default computed `blur(2px)` treatment and
  existing backdrop color, motion, dismissal, focus, inertness, stacking, and
  unsupported-browser behavior.
- **FR6 — Blur is progressive visual enhancement.** A blocking surface MUST
  remain understandable and operable when `backdrop-filter` is unsupported,
  ignored, or resolves to no blur. Visual separation and interaction blocking
  MUST NOT depend on blur alone.
- **FR7 — The frozen vocabulary remains closed otherwise.** Approval of this role
  MUST NOT admit a general blur category, a framework-compatible ladder, or any
  additional blur value by analogy. Every later portable blur role requires its
  own evidence and explicit approval.

### Why not a Tailwind-style blur ladder

A utility ladder names intensity; this proposal names purpose. A ladder would add
several portable promises without evidence that Astryx components share those
roles. It would also invite unrelated glass, motion, edge, and application
effects to depend on global values merely because their numbers are nearby.

Astryx themes need to answer “what does this value mean?” rather than “which step
looks close?” The three proven consumers all need the same role and default, so
one semantic token is the smallest durable contract. Astryx can interoperate with
Tailwind-authored applications without copying Tailwind's blur scale into its
portable theme API.

### Platform support

- **Feature and engine floor:** unchanged. The three current consumers already
  use `backdrop-filter: blur(2px)`; replacing the literal with a token does not
  add a browser capability.
- **Unsupported behavior:** when backdrop filtering is unavailable, the existing
  backdrop color and native modal behavior remain. No fallback blur or scripted
  emulation is introduced.
- **Browser evidence:** implementation must verify the tokenized default and
  unchanged no-filter fallback on representative blocking surfaces in real
  Chromium. Structural checks verify token inventory and generated projections.

### Accessibility and reduced transparency

The blur is supplementary decoration, not the source of modality, focus
containment, labeling, dismissal, or contrast. Those behaviors retain their
current owners. The scrim must continue to communicate separation without blur.

Current Astryx authority does not define a portable reduced-transparency mode or
require this static effect to follow reduced-motion. This proposal therefore does
not invent a media-query policy. If a future current accessibility contract
requires blur suppression, one semantic role gives that contract a single value
to reduce or set to zero without creating a scale or changing component anatomy.

## Compatibility and migration

This proposal is additive but public: once accepted and released, the exact token
name and semantic meaning become portable compatibility obligations.

- Existing themes that do not override the token receive the `2px` default, so
  the three current components remain visually unchanged.
- Existing component APIs, DOM, theme targets, backdrop colors, and motion remain
  unchanged.
- Existing custom CSS continues to cascade as it does today. This proposal does
  not claim or rename consumer-authored custom properties.
- Only `Dialog`, `Lightbox`, and `MobileNav` are known initial migrations. Other
  blur values and roles remain unchanged until separately admitted.
- Removing or renaming the token, or broadening its meaning beyond blocking page
  backdrops, requires an explicit compatibility decision after release.

## Current-state impact

Current `main` has a closed portable token vocabulary and three component-local
`blur(2px)` declarations for the same blocking-backdrop role. This draft changes
neither state.

If approved, [`architecture:theme-tokens`](../../architecture/theme-tokens.md)
will own the canonical token declaration and projections. Existing
[`architecture:component-style-authoring`](../../architecture/component-style-authoring.md)
guidance already delegates reusable semantic roles to that owner. [AST-006](../AST-006/spec.md)
continues to keep theme-family-local roles out of Core source; this proposal is
different because public Core components need the same role across themes.

## Verification

| Contract | Verification                                                                             | Representative states                                                          | Mutation or failure expectation                                                         |
| -------- | ---------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------- |
| FR1, FR7 | Portable token inventory, generated docs/template drift checks, and exact-name assertion | default theme; custom theme; no additional blur tokens                         | a second blur token, renamed token, missing projection, or scale entry fails            |
| FR2, FR3 | Source ownership check plus focused component assertions                                 | `Dialog`, `Lightbox`, `MobileNav`; blocking backdrop; unrelated blur treatment | a non-blocking/material effect adopts the token, or color/opacity becomes coupled to it |
| FR4, FR5 | Theme override and computed-style checks                                                 | default `2px`; custom length; light and dark modes                             | default output changes, an override is ignored, or another component behavior changes   |
| FR6      | Real-browser fallback evidence with filtering supported and suppressed                   | each representative blocking surface; open and closed states                   | removing blur removes modality, focus containment, or sufficient backdrop separation    |

## Acceptance criteria

This proposal is ready for owner approval only when all of the following are
true:

- it adds one role—`--blur-backdrop: 2px`—and no scale or adjacent effect token;
- the role is limited to page content behind a top-layer blocking surface;
- the three public Core consumers and their exact current value remain the only
  admission evidence;
- every excluded effect and application-specific value remains outside the
  portable vocabulary;
- compatibility, graceful degradation, and accessibility boundaries are explicit;
- the pull request changes knowledge only and passes repository knowledge
  validation; and
- the owner explicitly approves promotion from `authority: draft`; merge or
  silence alone does not make the proposal current.

## Follow-up implementation sequence

No implementation begins from this draft alone. After explicit approval and a
separate promotion to current authority:

1. Add the one canonical token and all existing portable-token projections and
   drift coverage required by `architecture:theme-tokens`.
2. Replace only the three qualifying blocking-backdrop literals, preserving
   backdrop color and every non-blur behavior.
3. Verify default parity, a theme override, and unsupported/no-filter fallback
   with focused structural checks and real-browser evidence.
4. Publish the normal compatibility/release note for the new public token. Do
   not add other blur roles during that implementation.

These steps may be delivered in the smallest reviewable stack that never treats
an unapproved draft as implementation authority.

## Decision log

### Proposed DEC-1 — Admit one semantic blocking-backdrop blur role

**Reference:** `spec:AST-037/DEC-1`
**Decision owner:** `cixzhang`
**Status:** proposed; not approved

Admit `--blur-backdrop` with default `2px` only for page content behind a
blocking top-layer surface. The repeated public Core role justifies one portable
semantic token while preserving visual parity and giving themes one intentional
override.

Rejected: keeping three permanent literals after the role has proven shared;
using a theme-family-local token that Core cannot consume; or admitting a
Tailwind-style blur ladder, general blur primitive, material effect, opacity
role, or application-specific values.

## Open questions

- **OQ1 — Should Astryx admit the exact `--blur-backdrop: 2px` role described
  above into the frozen portable vocabulary?** (`human-design`, owner:
  `cixzhang`)
