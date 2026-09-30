---
schema_version: 4
template_version: 1
kind: system-spec
id: spec:AST-049
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
phase: proposed
owners: [imdreamrunner]
affects_architecture:
  [
    architecture:theme-tokens,
    architecture:theme-authoring-contract,
    architecture:theme-compilation,
    architecture:theme-application,
  ]
affects_families: []
affects_contributing: []
affects_consumer_docs: [typography, theme]
---

# Pin target selection system spec

## Intent

Record the explorer's desktop-ratio → Pin-target recommendation and calculation.
This draft changes only the specification; related implementation is [PR #6699][pr].

## Non-goals

- Implementation changes, per-theme prescriptions, or additional policy.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Reference.** Inputs are desktop base `B`, ratio `r`, and the [role steps][choice].
- **FR2 — Base.** `M = max(B, 16)`; 16px-reference is `1rem`, not a document-root change.
- **FR3 — Activation.** Narrow AND primary-coarse, using the condition below.
- **FR4 — Pin.** Use the source recommendation and calculation below.

### Pin target

| Desktop ratio r    | Pin target; step a |
| ------------------ | ------------------ |
| `r <= 1.25`        | Display 1; `+6`    |
| `1.25 < r < 1.414` | Heading 2; `+2`    |
| `r >= 1.414`       | Heading 3; `+1`    |

Verbatim explorer comment, [lines 61–64][choice]:

> Recommended pin anchor for a given desktop ratio. Gentler scales can afford
> to pin high (the whole ladder is close together, so pinning Display 1 barely
> tames anything); more dramatic scales need a lower anchor so the display tier
> doesn't tower over 16px body text on a phone.

### Pin calculation

From the [explorer calculation][calculation]:

```text
M = max(B, 16)
r_pin = r * (B / M)^(1/a)
desktop(k) = Math.round(B * r^k)
mobile(k) = Math.round(M * r_pin^k)
rem = referencePx / 16
```

Roles above the pin shrink; below it grow (`B < 16`, before rounding).
When `B >= 16`, the base and ratio remain unchanged.

### Worked example

```text
B=14; r=1.333; a=2; M=16; r_pin=1.246907324142416
heading-2: 25→25px; body: 14→16px; display-1: 79→60px
```

### Mobile condition

`(width < 768px) and (pointer: coarse)`, as used in [PR #6699][pr].
Width is the layout viewport; coarse refers to the primary pointer.
[AST-012][adaptations] defines the effective md breakpoint and inheritance.

### Platform support

- Supported tiers: [AST-013][platform].
- Unsupported behavior: follow AST-013's fallback requirements.
- Browser-specific claims require evidence from that browser.

## Current-state impact

Only this draft record changes. The listed theme architecture surfaces and
`typography`/`theme` guides are its scope; [AST-012][adaptations] and
[theme application][application] retain ownership of the mechanisms.

## Verification

| Contract | Verification                         | Representative states                | Mutation or failure expectation |
| -------- | ------------------------------------ | ------------------------------------ | ------------------------------- |
| FR1, FR4 | Compare table with source function   | Picker ratios; 1.25/1.414 boundaries | Wrong target or boundary        |
| FR2, FR4 | Compare formula with generated sizes | Worked example; B>=16                | Changed anchor or base          |
| FR3      | Compare condition with PR rule       | Narrow/wide × coarse/fine            | Wrong conjunction or boundary   |

## Decision log

### DEC-1 — Theme base

**Reference:** `spec:AST-049/DEC-1`
**Decider:** Pending human approval.
**Source:** [Pin calculation][calculation] and [PR #6699][pr].

### DEC-2 — Ratio-to-target recommendation

**Reference:** `spec:AST-049/DEC-2`
**Decider:** Pending human approval.
**Source:** [Explorer recommendation][choice].

### DEC-3 — Narrow and primary-coarse

**Reference:** `spec:AST-049/DEC-3`
**Decider:** Pending human approval.
**Source:** [PR #6699][pr] and [AST-012][adaptations].

## Open questions

- **OQ1 — Apply the recommendation beyond the explorer's eight ratios at B=14?** (human-design)

[choice]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx#L38-L99
[calculation]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx#L126-L174
[pr]: https://github.com/facebook/astryx/pull/6699
[adaptations]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-012/spec.md
[application]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/architecture/theme-application.md
[platform]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-013/spec.md
