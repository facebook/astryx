---
schema_version: 1
template_version: 1
kind: system-spec
id: spec:AST-012
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [rubycheung]
affects_architecture: [architecture:theme-api]
affects_families: [family:layout, family:containers, family:overlays]
affects_contributing: []
affects_consumer_docs:
  [Theme, Layout, Section, Card, Dialog, Drawer, BottomSheet]
---

# Mobile spacing theme profile

## Intent

Astryx mobile themes should be able to make page and container spacing feel
appropriate on smaller screens without changing the internal geometry of every
component. The mobile spacing profile gives Astryx a recommended default, while
allowing product teams to tune the amount of compression or override individual
semantic spacing tokens when their surface needs a different rhythm.

## Non-goals

- Changing primitive spacing tokens such as `--spacing-1`, `--spacing-2`, or
  component-internal spacing globally.
- Making arbitrary `Stack`, `HStack`, `VStack`, `Grid`, or `Center` gaps
  automatically responsive. Explicit gaps remain author intent unless a
  component intentionally maps that area to a mobile semantic token.
- Applying mobile spacing based on touch capability. This profile responds to
  screen size / viewport behavior, not whether the device has touch input.
- Changing desktop or tablet spacing as part of the mobile proposal.
- Replacing product layout breakpoints. Mobile spacing tokens adjust spacing;
  responsive layout still belongs to the component or template.

## Requirements

- **FR1 — Mobile-only behavior.** The mobile spacing profile MUST apply only in
  the mobile viewport range. Desktop and tablet MUST continue to use current
  Astryx spacing unless a separate responsive contract explicitly changes them.
- **FR2 — Semantic token scope.** Mobile spacing MUST target semantic layout and
  container roles: page padding, section spacing, card/panel insets, dialog or
  drawer insets, and owned region gaps inside those containers.
- **FR3 — Primitive component spacing remains stable.** Buttons, inputs,
  segmented controls, badges, icons, form control internals, and arbitrary
  author-authored stack/grid gaps MUST NOT be automatically recomputed by the
  mobile spacing profile.
- **FR4 — Presets provide recommended defaults.** The S/M/L/XL spacing presets
  MUST provide default mobile values for each semantic token so teams can adopt
  the mobile profile without designing a new scale from scratch.
- **FR5 — Intensity is adjustable.** Consumers SHOULD be able to choose a mobile
  spacing intensity that changes how strongly semantic spacing compresses.
- **FR6 — Explicit semantic overrides win.** Consumers MUST be able to override
  individual mobile semantic tokens. A token override takes precedence over both
  the preset recommendation and the intensity-derived value.
- **FR7 — Published themes use explicit values.** The formula is a design tool
  for deriving recommended values. Shipped themes SHOULD publish explicit token
  values so consumers can inspect, diff, and override the final contract.

## Proposed token model

The mobile spacing profile is layered:

1. Start with the selected Astryx spacing preset.
2. Apply the recommended mobile intensity for that preset.
3. Allow a product team to override the intensity.
4. Allow a product team to override individual semantic tokens.

The precedence order is:

```text
semantic token override
→ custom mobile intensity
→ Astryx recommended preset default
→ current desktop/tablet semantic value
```

### Semantic tokens

| Token                                  | Role                                           | Default component scope             |
| -------------------------------------- | ---------------------------------------------- | ----------------------------------- |
| `--astryx-layout-padding-inline`       | Page left/right padding                        | Layout and page shell               |
| `--astryx-layout-padding-block`        | Page top/bottom padding                        | Layout and page shell               |
| `--astryx-mobile-section-gap`          | Major space between page regions               | Opt-in layout regions               |
| `--astryx-section-padding`             | Section inset                                  | Section                             |
| `--astryx-card-padding`                | Card or panel inset                            | Card, ClickableCard, SelectableCard |
| `--astryx-mobile-container-region-gap` | Space between owned regions inside a container | Cards and panels                    |
| `--astryx-dialog-padding`              | Overlay inset                                  | Dialog, Drawer, Bottom Sheet        |
| `--astryx-mobile-overlay-region-gap`   | Space between owned regions inside an overlay  | Dialog, Drawer, Bottom Sheet        |

## Recommended default formula

The default formula is intentionally gentle and linear:

```text
mobile(s, base) = s - (base × intensity)
```

Where:

- `s` is the current semantic spacing value.
- `base` is the selected spacing preset's source unit.
- `intensity` is the mobile compression strength.

Recommended preset intensities:

| Preset          | Base | Recommended mobile intensity | Rationale                                                  |
| --------------- | ---: | ---------------------------: | ---------------------------------------------------------- |
| S / Compact     |  2px |                            0 | Already compact; do not compress further.                  |
| M / Default     |  4px |                          0.5 | Slightly tighter without making default feel like compact. |
| L / Comfortable |  6px |                            1 | Reduce one preset step for mobile.                         |
| XL / Gigantic   |  8px |                            1 | Reduce one preset step for mobile.                         |

The formula gives a consistent explanation for the recommendation while keeping
the final token values inspectable and editable.

### Recommended explicit values

| Semantic token             | S current → mobile | M current → mobile | L current → mobile | XL current → mobile |
| -------------------------- | -----------------: | -----------------: | -----------------: | ------------------: |
| Page inline padding        |          8px → 8px |        16px → 14px |        24px → 18px |         32px → 24px |
| Page block padding         |          8px → 8px |        16px → 14px |        24px → 18px |         32px → 24px |
| Major section gap          |        12px → 12px |        24px → 22px |        36px → 30px |         48px → 40px |
| Section inset              |          8px → 8px |        16px → 14px |        24px → 18px |         32px → 24px |
| Card/panel inset           |          8px → 8px |        16px → 14px |        24px → 18px |         32px → 24px |
| Owned container region gap |          6px → 6px |        12px → 10px |        18px → 12px |         24px → 16px |
| Dialog/drawer inset        |          8px → 8px |        16px → 14px |        24px → 18px |         32px → 24px |
| Owned overlay region gap   |          6px → 6px |        12px → 10px |        18px → 12px |         24px → 16px |

## Customization model

Consumers can customize at two levels.

### Intensity override

Use intensity when a product wants the whole mobile layout rhythm to become more
or less compact while preserving the same token relationships.

Example conceptual API:

```ts
mobileSpacing: {
  intensity: 0.5,
}
```

Potential named presets:

| Intensity name | Value | Behavior                                      |
| -------------- | ----: | --------------------------------------------- |
| `none`         |     0 | Mobile keeps current semantic spacing.        |
| `gentle`       |   0.5 | Mobile reduces spacing by a half source step. |
| `standard`     |     1 | Mobile reduces spacing by one source step.    |
| `dense`        |   1.5 | Mobile reduces spacing more aggressively.     |

### Semantic token override

Use token overrides when the recommended intensity is mostly right but a
specific area needs a different value.

Example conceptual API:

```ts
mobileSpacing: {
  intensity: 'gentle',
  tokens: {
    layoutPaddingInline: '16px',
    cardPadding: '12px',
  },
}
```

The token override wins over the intensity-derived value.

## Implementation guidance

- Components SHOULD opt in by reading semantic spacing tokens for owned layout
  roles, not by rewriting primitive spacing variables.
- Layout and Section MAY map default page/section padding to the semantic page
  and section tokens.
- Card-like components MAY map default insets to card/panel tokens.
- Dialog, Drawer, and Bottom Sheet MAY map default insets and owned region gaps
  to overlay tokens.
- Arbitrary `gap`, `padding`, or `margin` props supplied directly by consumers
  remain authoritative.
- If a component currently hardcodes layout spacing that should respond to the
  mobile profile, that should be treated as a component implementation issue and
  migrated to a semantic token-compatible default without changing explicit
  consumer-provided values.

## Current-state impact

- The mobile profile extends the existing mobile theme beyond typography.
- Existing component-internal spacing should remain stable.
- Existing desktop and tablet layouts should remain stable.
- Compatibility risk is concentrated in components that currently hardcode
  default layout/container spacing and therefore cannot respond to theme tokens.
  Those should be migrated by making only their defaults themeable; explicit
  consumer values should continue to win.

## Verification

| Contract | Verification                           | Representative states                                      | Failure signal                                                                                       |
| -------- | -------------------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| FR1      | Sandbox viewport comparison            | Mobile, tablet, desktop                                    | Mobile proposal changes tablet or desktop spacing.                                                   |
| FR2, FR3 | Product Detail sandbox preview         | Page padding, section gap, card inset, control internals   | Buttons, inputs, badges, or control geometry change when only semantic spacing should change.        |
| FR4      | Token values table                     | S/M/L/XL presets                                           | Preset values are missing, duplicated unintentionally, or inconsistent with the documented defaults. |
| FR5, FR6 | Token override controls                | Recommended defaults, custom intensity, per-token override | An override fails to win over the recommended value or affects the wrong viewport.                   |
| FR7      | Theme snapshot / generated token audit | Mobile theme package output                                | Published theme depends on runtime formula rather than explicit token values.                        |

## Decision log

### DEC-1 — Use semantic spacing tokens instead of primitive mobile spacing

**Reference:** `spec:AST-012/DEC-1`
**Status:** proposed

Mobile spacing should be expressed through semantic layout/container tokens. This
keeps component internals stable while still allowing page structure, sections,
cards, panels, and overlays to become more compact on mobile.

Rejected: globally changing the primitive spacing scale for mobile, because that
would resize low-level component geometry and make controls less predictable.

### DEC-2 — Use gentle linear compression by default

**Reference:** `spec:AST-012/DEC-2`
**Status:** proposed

The recommended mobile values should use a gentle linear adjustment rather than
the earlier proportional `s ÷ √2` candidate. Compact stays unchanged, default
gets a half-step reduction, and larger presets get a one-step reduction.

Rejected: using a single exponential or proportional curve as the shipped rule,
because it compressed larger values too aggressively and made the default preset
feel too close to compact.

### DEC-3 — Allow intensity and token-level customization

**Reference:** `spec:AST-012/DEC-3`
**Status:** proposed

Teams should be able to accept Astryx's recommended mobile spacing defaults,
adjust the overall intensity, or override individual semantic tokens. This makes
the default opinionated while keeping the theme flexible for product-specific
layouts.

## Open questions

- Should intensity be a named enum, a numeric multiplier, or both?
- Should tablet ever receive a separate spacing profile, or should this spec
  remain mobile-only?
- Which core components should be included in the first implementation pass for
  semantic token adoption?
