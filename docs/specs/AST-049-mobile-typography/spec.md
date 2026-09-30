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
owners: [imdreamrunner, rubyycheung]
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

To balance the rest of the text styles with inputs' automatic 16px-reference
minimum on coarse-pointer iOS devices, the mobile scale MUST raise a desktop
base below 16px-reference to 16px-reference and choose a pin target from the
desktop ratio. The selected role MUST retain its desktop size.

## Non-goals

- Implementation changes, per-theme prescriptions, or additional policy.
- Equivalent internal implementations remain valid when they satisfy this contract.

## Requirements

- **FR1 — Reference scale.** Desktop base `B`, ratio `r`, and raw step `k` define the desktop sizes.
- **FR2 — Base.** Set `M = max(B, 16)`; 16px-reference is `1rem`, not a document-root change.
- **FR3 — Activation.** Apply the mobile profile only when narrow AND primary-coarse.
- **FR4 — Pin.** Choose the target from the table and preserve it in the mobile scale.

### Pin target

| Desktop ratio r    | Pin target; step a | Design intent                                                                         |
| ------------------ | ------------------ | ------------------------------------------------------------------------------------- |
| `r <= 1.25`        | Display 1; `+6`    | Retain the compact scale's display size as the reading base increases.                |
| `1.25 < r < 1.414` | Heading 2; `+2`    | Preserve Heading 2 while reducing larger display roles relative to body text.         |
| `r >= 1.414`       | Heading 3; `+1`    | Preserve Heading 3 so the display tier does not dominate body text on narrow screens. |

### Pin calculation

Derive the mobile scale from the desktop inputs and selected step `a`:

```text
M = max(B, 16)
r_pin = r * (B / M)^(1/a)
desktop(k) = Math.round(B * r^k)
mobile(k) = Math.round(M * r_pin^k)
rem = referencePx / 16
```

Roles above the pin shrink; below it grow (`B < 16`, before rounding).
When `B >= 16`, retain the desktop base and ratio.

### Worked example

```text
B=14; r=1.333; a=2; M=16; r_pin=1.246907324142416
heading-2: 25→25px; body: 14→16px; display-1: 79→60px
```

### Mobile condition

By default, mobile MUST match `(width < 768px) and (pointer: coarse)`.
Width is the layout viewport; coarse refers to the primary pointer.
Use the effective `md` breakpoint governed by `spec:AST-012`; the stock value is
768 CSS px and the upper edge is exclusive.

### Platform support

- Supported browsers follow `spec:AST-013`.
- Unsupported behavior follows its fallback contract.
- Browser-specific behavior requires evidence from that browser.

## Current-state impact

Theme token, authoring, compilation, and application contracts, and the
`typography`/`theme` guides, are affected; ownership remains with their existing records.
This PR changes only the specification; related implementation is [PR #6699][implementation].

## Verification

| Contract | Verification                      | Representative states                  | Mutation or failure expectation |
| -------- | --------------------------------- | -------------------------------------- | ------------------------------- |
| FR1, FR4 | Check the ratio-to-target mapping | Ratios below, at, and above 1.25/1.414 | Wrong target or boundary        |
| FR2, FR4 | Check calculated sizes            | Worked example; B>=16                  | Changed anchor or base          |
| FR3      | Check the activation condition    | Narrow/wide × coarse/fine              | Wrong conjunction or boundary   |

## Decision log

### DEC-1 — Theme base

**Reference:** `spec:AST-049/DEC-1`
**Decider:** Pending human approval.
**Decision:** Raise bases below 16px-reference without changing the document root.

### DEC-2 — Ratio-to-target mapping

**Reference:** `spec:AST-049/DEC-2`
**Decider:** Pending human approval.
**Decision:** Pin Display 1, Heading 2, or Heading 3 according to the desktop ratio.

### DEC-3 — Narrow and primary-coarse

**Reference:** `spec:AST-049/DEC-3`
**Decider:** Pending human approval.
**Decision:** Activate the mobile profile only on narrow, primary-coarse viewports.

## Open questions

- **OQ1 — Which desktop base sizes and ratios must this policy support?** (human-design)

[implementation]: https://github.com/facebook/astryx/pull/6699
