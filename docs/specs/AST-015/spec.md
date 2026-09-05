---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-015
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubyycheung]
affects_architecture:
  [
    architecture:theme-authoring-contract,
    architecture:theme-application,
    architecture:theme-tokens,
    architecture:container-padding,
  ]
affects_families: [family:layout-regions, family:layout-primitives]
affects_contributing: []
affects_consumer_docs: [Theme, Layout, Section, Card, Dialog]
---

# Spacing profile for the mobile theme

## Intent

This spec defines the spacing portion of Astryx's mobile theme. It is not a
separate "Mobile Spacing" theme or standalone API.

The mobile theme should make structural spacing feel appropriate on small
viewports without changing the internal geometry of every component that happens
to use a spacing token.

The proposed direction is:

1. Keep the primitive spacing scale stable.
2. Define a small mobile spacing profile from the selected spacing preset.
3. Apply that profile through targeted component theme overrides for layout and
   container components.
4. Let products tune the profile intensity or override specific component
   defaults when needed.

This extends the mobile theme with a spacing solution without creating an
endless set of global semantic spacing tokens.

## Problem

The current Astryx spacing preset changes primitive spacing values. That is
useful for broad theme density, but it is too broad for mobile spacing.

Primitive spacing is used by many different kinds of UI:

- page padding;
- section gaps;
- card or panel insets;
- button and input internals;
- segmented control geometry;
- badge, chip, and icon alignment;
- table row density; and
- arbitrary `Stack`, `HStack`, `VStack`, `Grid`, or `Center` gaps authored by a
  product.

If the mobile theme globally compresses primitive spacing, all of those areas
change together. That makes mobile layouts more compact, but it can also
accidentally shrink controls and component internals that should remain stable.

The mobile spacing problem is narrower: change the spacing that defines page
structure and containers, while leaving most component internals alone.

## Non-goals

- Redefining every primitive `--spacing-*` token for mobile.
- Shrinking buttons, inputs, chips, segmented controls, icons, or other
  component internals merely because the viewport is mobile.
- Tying the mobile spacing theme to touch capability, pointer type, or input
  modality. Mobile spacing is about screen/layout constraints, not whether the
  user is using touch, mouse, keyboard, or trackpad.
- Making arbitrary `Stack`, `HStack`, `VStack`, `Grid`, or `Center` gaps
  automatically responsive. A generic `gap={4}` should continue to mean
  "use spacing-4" unless the author intentionally opts into a mobile layout
  role.
- Changing desktop or tablet spacing behavior as part of this mobile proposal.
- Defining a global semantic token for every possible product-specific spacing
  need.

## Requirements

- **FR1 — Mobile-only behavior.** The mobile spacing profile MUST apply only in
  the mobile viewport range. Desktop and tablet MUST continue to use current
  Astryx spacing unless a separate responsive contract explicitly changes them.
- **FR2 — Primitive spacing remains stable.** The mobile spacing profile MUST
  NOT redefine the portable primitive spacing scale. Components that use
  primitive spacing for their internal geometry MUST keep their existing spacing
  unless that component is explicitly included in the mobile profile.
- **FR3 — Apply through component theme overrides.** The recommended mobile
  spacing values SHOULD be applied through targeted component theme overrides,
  not through a broad primitive-token replacement.
- **FR4 — Component defaults only.** Mobile spacing applies to component
  defaults. If a consumer passes an explicit spacing prop such as `padding`,
  `gap`, `paddingInline`, or `space`, that authored value MUST remain
  authoritative.
- **FR5 — Initial component scope is small.** The v1 profile SHOULD focus on
  layout and container components: Layout/page shell, Section, Card/Panel, and
  Dialog/Drawer/Bottom Sheet.
- **FR6 — Presets provide recommended defaults.** The S/M/L/XL spacing presets
  MUST provide recommended mobile values so teams can adopt the mobile profile
  without designing a new scale from scratch.
- **FR7 — Intensity is adjustable.** Consumers SHOULD be able to choose a mobile
  spacing intensity that changes how strongly the included component defaults
  compress.
- **FR8 — Specific overrides are allowed.** Consumers MUST be able to override
  individual mobile component spacing values when a product needs to diverge
  from the recommended profile.
- **FR9 — Global semantic tokens are exceptional.** A new shared semantic
  spacing token SHOULD be added only when the spacing relationship needs to be
  reused across multiple component families or exposed as its own theme-level
  decision.

## Proposed model

The mobile spacing profile is a coordinated set of recommended values. The
profile is part of the mobile theme and is not a replacement primitive scale.

Conceptually:

```ts
const mobileSpacing = createMobileSpacingProfile({
  spacingBase: 4,
  intensity: 0.5,
});
```

The profile can then feed component theme overrides:

```ts
const theme = {
  mobile: {
    spacing: mobileSpacing,
    components: {
      Layout: {
        content: {
          paddingInline: mobileSpacing.pagePaddingInline,
          paddingBlock: mobileSpacing.pagePaddingBlock,
        },
      },
      Section: {
        padding: mobileSpacing.sectionInset,
        gap: mobileSpacing.sectionGap,
      },
      Card: {
        padding: mobileSpacing.containerInset,
      },
      Dialog: {
        padding: mobileSpacing.overlayInset,
      },
    },
  },
};
```

The exact API names are illustrative and should align with the mobile theme API
being implemented separately. The important contract is that the mobile theme
updates selected component defaults instead of globally changing `--spacing-*`.

## Override precedence

Mobile spacing should never make explicit author intent mysterious.

Precedence:

```text
explicit component prop
→ mobile-scoped component theme override
→ regular component theme override
→ normal component default
```

Example:

```tsx
// Uses the mobile theme's Section default on mobile.
<Section>...</Section>

// Does not use the mobile theme's Section padding default,
// because the product intentionally authored a value.
<Section padding={6}>...</Section>
```

The same principle applies to `Card padding={...}`, `Dialog padding={...}`,
`LayoutContent paddingInline={...}`, and authored layout gaps such as
`<VStack gap={...}>`.

## Recommended formula

The current recommendation uses a gentle linear adjustment:

```text
mobileValue = currentValue - (spacingBase × intensity)
```

Where:

- `currentValue` is the component's normal desktop/tablet spacing default.
- `spacingBase` is the selected Astryx spacing preset unit:
  - S / Compact = 2px
  - M / Default = 4px
  - L / Comfortable = 6px
  - XL / Gigantic = 8px
- `intensity` is the mobile compression strength.

Recommended preset intensities:

| Preset          | Base | Recommended intensity | Meaning                                                    |
| --------------- | ---: | --------------------: | ---------------------------------------------------------- |
| S / Compact     |  2px |                     0 | Already compact; do not compress further.                  |
| M / Default     |  4px |                   0.5 | Slightly tighter without making default feel like compact. |
| L / Comfortable |  6px |                     1 | Reduce by one source step.                                 |
| XL / Gigantic   |  8px |                     1 | Reduce by one source step.                                 |

Optional intensity landmarks:

| Intensity | Value | Example with 8px base |
| --------- | ----: | --------------------: |
| None      |     0 |         0px reduction |
| Gentle    |   0.5 |         4px reduction |
| Standard  |     1 |         8px reduction |
| Dense     |   1.5 |        12px reduction |

The formula is a design and authoring helper. Shipped themes should still output
explicit component override values so authors can inspect, diff, and customize
the final result.

## Recommended default values

These values show the current recommendation if the profile is applied to common
layout/container defaults.

| Role                 | Component scope                 | S / 2px base | M / 4px base | L / 6px base | XL / 8px base |
| -------------------- | ------------------------------- | -----------: | -----------: | -----------: | ------------: |
| Page inline padding  | Layout/page shell               |    8px → 8px |  16px → 14px |  24px → 18px |   32px → 24px |
| Page block padding   | Layout/page shell               |    8px → 8px |  16px → 14px |  24px → 18px |   32px → 24px |
| Major section gap    | Layout/Section regions          |  12px → 12px |  24px → 22px |  36px → 30px |   48px → 40px |
| Section inset        | Section                         |    8px → 8px |  16px → 14px |  24px → 18px |   32px → 24px |
| Container inset      | Card/Panel-like surfaces        |    8px → 8px |  16px → 14px |  24px → 18px |   32px → 24px |
| Container region gap | Owned regions inside containers |    6px → 6px |  12px → 10px |  18px → 12px |   24px → 16px |
| Overlay inset        | Dialog/Drawer/Bottom Sheet      |    8px → 8px |  16px → 14px |  24px → 18px |   32px → 24px |
| Overlay region gap   | Owned regions inside overlays   |    6px → 6px |  12px → 10px |  18px → 12px |   24px → 16px |

These are not proposed as new primitive spacing tokens. They are recommended
mobile defaults for selected component theme properties.

## How customization works

### Use the recommended profile

Most teams should be able to opt into the default mobile profile:

```ts
const theme = createTheme({
  mobile: {
    typography: '...',
    spacing: {
      preset: 'M',
      intensity: 'recommended',
    },
  },
});
```

For the M preset, this would apply a gentle half-step reduction to included
layout/container component defaults.

### Adjust the overall intensity

If the whole mobile layout should feel more or less compact, adjust the
intensity:

```ts
const theme = createTheme({
  mobile: {
    typography: '...',
    spacing: {
      preset: 'M',
      intensity: 1,
    },
  },
});
```

With a 4px base, intensity `1` reduces included component defaults by 4px.

### Override one component default

If the recommended profile mostly works but one component needs to diverge,
override that component's mobile default:

```ts
const theme = createTheme({
  mobile: {
    typography: '...',
    spacing: {
      preset: 'M',
      intensity: 'recommended',
      components: {
        Card: {
          padding: '16px',
        },
      },
    },
  },
});
```

This keeps the coordinated profile for the rest of the mobile theme while making
Card intentionally roomier.

### Avoid changing primitive spacing globally

This is the path the spec should avoid:

```ts
const theme = createTheme({
  mobile: {
    typography: '...',
    spacing: {
      primitives: {
        4: '12px',
        5: '16px',
        6: '20px',
      },
    },
  },
});
```

That would affect every component that uses those primitive spacing steps,
including controls and internals that should not become smaller just because the
viewport is mobile.

## Guidance for theme authors

Mobile spacing overrides are intended to move related layout spacing together so
the page keeps a consistent rhythm on smaller screens.

For most mobile spacing adjustments, prefer tuning the coordinated mobile
spacing profile before adding new global spacing tokens. Add a new semantic
token only when a spacing relationship needs to be shared across multiple
component families or exposed as its own theme-level decision.

Suggested comment near implementation:

```ts
// Mobile spacing intentionally adjusts selected layout/container defaults
// together. Prefer changing the shared mobile spacing profile or intensity
// before adding new global spacing tokens. Component-specific overrides are
// still available when a surface needs to intentionally diverge.
```

## Token admission criteria

A spacing value should become a shared global semantic token only if all of
these are true:

1. It describes a reusable layout relationship, not one component's private
   implementation detail.
2. It applies across multiple component families, templates, or product
   surfaces.
3. Theme authors need to tune it independently from the rest of the mobile
   spacing profile.
4. It cannot be handled clearly by an existing component prop or component theme
   override.
5. It has a clear scope boundary so it does not become a catch-all spacing
   token.

If those criteria are not met, prefer a component theme override or a
product-owned custom value.

## Representative layout example

Use a Product Detail template as the first validation example because it has a
mix of structural layout, container surfaces, and component internals.

The mobile profile may affect:

- outer page/content padding;
- major gaps between product media, product information, and supporting
  sections;
- default card or panel inset values when the component does not receive an
  explicit padding prop; and
- owned region gaps inside container-like surfaces when those regions are part
  of the component default.

The mobile profile should not affect:

- button padding;
- input height or inset;
- segmented control geometry;
- badge/chip/icon spacing;
- image aspect ratios;
- product-authored `Stack`, `Grid`, or `VStack` gaps unless the template
  intentionally opts that area into the mobile spacing profile; or
- any explicit spacing prop passed by the product.

This example should make the ownership boundary visible: page structure can
become tighter on mobile, while the product controls still feel like the same
Astryx components.

### Product Detail model comparison

The same Product Detail layout should be used to compare possible mobile spacing
models before accepting the contract.

| Model                                       | Product Detail behavior                                                              | What changes                                                                                 | What stays stable                                                           | Risk                                                                               |
| ------------------------------------------- | ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ---------------------------------------------------------------------------------- |
| Primitive spacing override                  | Every `--spacing-*` value used by the template becomes smaller on mobile.            | Page padding, section gaps, card insets, controls, thumbnails, and component internals.      | Nothing is guaranteed to stay stable unless each component protects itself. | Too broad; mobile theme can accidentally change component geometry.                |
| Large semantic token set                    | The template maps many page and component areas to public semantic tokens.           | Precise areas can be tuned independently.                                                    | Component internals can stay stable if they are excluded.                   | Token sprawl; easy to create hyper-specific tokens that are hard to reason about.  |
| Component-owned adaptation                  | Each component decides whether its own defaults should change at mobile breakpoints. | Component defaults for components that implement mobile behavior.                            | Other components and explicit props.                                        | Page rhythm can become inconsistent because each component makes a local decision. |
| Shared mobile profile + component overrides | Layout/container defaults receive coordinated mobile values through the theme.       | Page padding, section gap, card/panel inset, overlay inset, and owned container-region gaps. | Primitive spacing, control internals, image geometry, and explicit props.   | Best balance for v1; needs clear rules for which components are included.          |

This comparison is why the proposed direction is a shared mobile profile applied
through component theme overrides. It gives Product Detail the structural mobile
adjustments it needs without redefining primitives or creating a global token for
every local spacing decision.

## Alternatives considered

### A. Change the primitive spacing scale on mobile

This is the simplest implementation, but it is too broad. It changes layout
spacing and component internals at the same time.

Status: rejected for this proposal.

### B. Publish a large global semantic spacing token set

This gives theme authors many hooks, but it risks creating a hard-to-reason-about
taxonomy of hyper-specific tokens.

Status: not recommended as the default path. Semantic tokens should be reserved
for shared relationships that meet the token admission criteria.

### C. Let each component independently adapt on mobile

This preserves component ownership, but it can make the page rhythm inconsistent
because every component makes a local decision.

Status: useful for component internals; incomplete for coordinated layout
spacing.

### D. Use a shared mobile spacing profile applied through component theme overrides

This keeps primitives stable, avoids semantic token sprawl, and gives Astryx a
coordinated default for the components that should participate.

Status: proposed direction.

## Implementation guidance

- Start with the smallest supported component list: Layout/page shell, Section,
  Card/Panel-like surfaces, Dialog, Drawer, and Bottom Sheet.
- Apply mobile spacing only to default values. Explicit consumer-authored props
  continue to win.
- Use the profile helper to generate coordinated values, then emit explicit
  component theme overrides.
- Keep primitive spacing tokens unchanged in the mobile theme.
- Do not make arbitrary Stack/Grid gaps responsive by default.
- If a product-specific template needs a mobile spacing role, prefer a
  product-owned theme value or component override before proposing a new shared
  global token.

## Current-state impact

This spec changes the direction of the spacing work inside the mobile theme from
"publish a broad semantic spacing token set" to "apply a coordinated mobile
spacing profile through targeted component theme overrides."

Expected impact:

- The existing primitive spacing scale remains unchanged.
- Existing desktop and tablet spacing remains unchanged.
- Component internals remain unchanged unless a component is explicitly included
  in the mobile profile.
- Explicit spacing props passed by consumers remain authoritative.
- The mobile theme gains a clearer path for structural spacing without requiring
  every product-specific spacing need to become a shared global token.

Compatibility risk is concentrated in components whose default structural
spacing is currently hardcoded or only configurable through explicit props. Those
components may need an additive theme-default entry point so mobile can adjust
the omitted default value while preserving existing explicit prop behavior.

## Verification

| Contract | Verification                                 | Representative states                                   | Failure signal                                                            |
| -------- | -------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------- |
| FR1      | Compare mobile, tablet, and desktop previews | Mobile, tablet, desktop widths                          | Mobile proposal changes tablet or desktop spacing.                        |
| FR2      | Component visual checks                      | Button, Input, Badge, SegmentedControl                  | Component internals shrink when only mobile layout spacing should change. |
| FR3, FR5 | Component theme snapshot or visual checks    | Layout, Section, Card/Panel, Dialog/Drawer/Bottom Sheet | Included components do not pick up mobile defaults.                       |
| FR4      | Explicit prop precedence test                | `<Section padding={6}>`, `<Card padding={6}>`           | Mobile theme overrides an explicit authored prop.                         |
| FR6, FR7 | Generated values table                       | S/M/L/XL presets and custom intensity                   | Preset values are missing or intensity does not update included defaults. |
| FR8      | Component override test                      | Card or Section override                                | Per-component override fails to win over the profile value.               |
| FR9      | Spec review for new spacing hooks            | Proposed new global token                               | Token is component-specific or lacks cross-component reuse.               |

## Decision log

### DEC-1 — Do not globally compress primitive spacing

**Reference:** `spec:AST-015/DEC-1`
**Status:** proposed

The mobile theme should keep the primitive spacing scale stable. Global
primitive compression would affect controls and internals that are not part of
the mobile layout problem.

### DEC-2 — Use component theme overrides as the primary mobile spacing mechanism

**Reference:** `spec:AST-015/DEC-2`
**Status:** proposed

Targeted component theme overrides provide a clear mobile implementation path
without requiring a large public semantic token set. Layout/container components
can participate, while buttons, inputs, badges, segmented controls, and arbitrary
author-authored gaps remain stable.

### DEC-3 — Use a shared profile helper to keep overrides coordinated

**Reference:** `spec:AST-015/DEC-3`
**Status:** proposed

The profile helper gives Astryx one place to define the recommended spacing
formula and preset defaults. Components consume the resulting values through
their theme overrides, which avoids duplicating unexplained numbers across the
mobile theme file.

### DEC-4 — Semantic tokens are reserved for shared spacing relationships

**Reference:** `spec:AST-015/DEC-4`
**Status:** proposed

Semantic tokens remain available, but they should not be the default answer for
every mobile spacing need. A semantic token should be added only when the
relationship is shared, reusable, and worth exposing as an independent
theme-level decision.

## Open questions

- **OQ1 — Exact API shape.** Should the profile be authored as
  `mobileSpacing`, `responsiveSpacing`, component theme overrides, or a helper
  that generates component theme values?
- **OQ2 — First component list.** Which components are included in v1:
  Layout/page shell, Section, Card/Panel, Dialog, Drawer, and Bottom Sheet are
  likely candidates.
- **OQ3 — Activation mechanism.** Should mobile spacing be activated by a
  viewport-scoped theme, responsive theme condition, or mobile theme package?
- **OQ4 — Default value acceptance.** Are the proposed S/M/L/XL values gentle
  enough in real templates, or should the recommended intensities be adjusted
  before acceptance?
