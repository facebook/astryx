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

**Summary:** Pick the mobile Pin target from the **desktop ratio**:
**`1 < r <= 1.25` → Display 1 (+6); `1.25 < r < 1.414` → Heading 2 (+2);
`r >= 1.414` → Heading 3 (+1).** Then derive the mobile ratio from that target.

This is a theme-agnostic authoring rule for geometric scales, not a catalog of
individual themes. The proposal remains **draft**. This PR changes only this spec;
related theme implementation is in [PR #6699][pr].

## Non-goals

- Per-theme inventories, endpoint tables, or new universal small-text floors.
- Changing the document root, desktop scale, type identity, or component API.
- Automatically enrolling themes or inferring targets from device/theme names.
- Prescribing private implementation structure; equivalent implementations remain valid.

## Requirements

### Pick the target from the desktop ratio

**From explorer/code:** the three choices and exact thresholds below come from
[the recommendation function and its comments, lines 60–77][choice].

| Desktop ratio r    | Pin target; step a | Common ratios in this range | Why this target                                                                                                                          |
| ------------------ | ------------------ | --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `1 < r <= 1.25`    | **Display 1; +6**  | 1.067, 1.125, 1.2, 1.25     | Gentle scales need little reduction. A lower pin would unnecessarily shrink displays and flatten an already gentle hierarchy.            |
| `1.25 < r < 1.414` | **Heading 2; +2**  | 1.333                       | Hold a mid-heading and let larger roles shrink. +6 leaves the display tier high; +1 compresses it more than this branch recommends.      |
| `r >= 1.414`       | **Heading 3; +1**  | 1.414, 1.5, 1.618           | Stronger reduction of large headings/displays. A higher pin keeps a steeper mobile ratio, larger displays, and smaller below-base roles. |

`1.25` belongs to +6; `1.414` belongs to +1. The second cutoff is the literal
**1.414**, not √2. Classify the original desktop ratio, never a rounded label or
the already-derived mobile ratio. The target changes discretely at the cutoffs.

**Proposed completion:** admit finite `B > 0` and `r > 1`, subject to the checks
below. Continue the same branches outside the explorer's 1.067–1.618 picker;
that wider applicability is not evidence of tested visual suitability (OQ1).

- **FR1 — Scope.** Use the rule for geometric scales with Astryx's raw-step meanings;
  it selects a default target, not a theme's identity or adoption status.
- **FR2 — Base.** Set `M = max(B, 16)`, without changing `html`/`:root` or rem.
  When `B >= 16`, the ratio and complete scale are unchanged, whatever the target.
- **FR3 — Activation.** Apply the profile only to narrow AND primary-coarse
  viewports, as defined below; other environments keep their desktop values.
- **FR4 — Target.** The default target MUST follow the table. Preserve that target,
  not Display 1 in every scale. Do not blend targets or interpolate with viewport width.
- **FR5 — Constraints.** A small-role floor failure MUST NOT silently select a
  different target. Report it and make any semantic adjustment explicit.
- **FR6 — Type identity.** Preserve families, weights, tracking, and semantic HTML.
  Any explicit size correction needs leading derived from its final size.
- **FR7 — Presentation.** CSS owns environment selection; do not require a resize
  handler, content remount, or different server/client markup.
- **FR8 — Overrides.** Keep existing author overrides. A custom target is an explicit
  departure from the default rule, not a new interpretation of a ratio range.
- **FR9 — Parity.** Runtime, built, and copied themes must agree on the selected
  target and resulting tokens. JavaScript token reads remain root-value reads.
- **FR10 — Precision.** Use unrounded inputs for selection/calculation and validate
  any serialized ratio against the complete generated output, not just the body.
- **FR11 — Failure.** Reject an infeasible default profile; do not hide failed
  hierarchy, floor, or anchor checks behind another target or a raw-token clamp.
- **FR12 — Compatibility.** Existing [AST-017][compatibility] owns any later package
  change. This specification makes no package change and needs no Changeset.

### Derive and check the scale

Given reference-pixel base `B` and desktop ratio `r`:

1. Validate the inputs; select `a` from the table using **desktop r**.
2. Compute the [explorer's Pin equations, lines 141–174][calculation]:

```text
M = max(B, 16)
r_pin = r * (B / M)^(1/a)
desktop(k) = Math.round(B * r^k)
mobile(k) = Math.round(M * r_pin^k)
rem = referencePx / 16
```

3. Check finite outputs and `r_pin > 1`. A flat/inverted unrounded ladder is infeasible;
   do not silently move the pin. Step 0 must be 16px-reference when `B < 16`.
4. Check `mobile(a) == desktop(a)` after rounding. Keep full precision during
   calculation. A four-decimal stored ratio is allowed **only after parity checks**
   for all generated sizes and leading; otherwise retain more precision.
5. Check small roles against the product's declared minima. Relative growth is not
   proof that a minimum was reached. **Do not auto-move the target.** Revise the
   inputs or explicitly override affected semantic sizes and final-size leading;
   such corrections are separate from the geometric Pin result.
6. If the named role is absent, retain its **virtual raw-step anchor**. Do not pick
   the nearest visible heading: that would make the rule depend on page contents.

Steps 3–6's validation/absence policy is **proposed completion**. The explorer
floors the base but does not guarantee arbitrary small-role minima. Its manual
controls are not an automatic floor-repair algorithm.

Before integer rounding, mobile/desktop at step `k` is `(M/B)^(1-k/a)`.
For `M > B`, steps **below a grow**, **a stays fixed**, and **above a shrink**;
rounding may make a visible change zero. Higher `a` means a larger `r_pin`:
**less** ratio compression, not more. This is a discrete scale, not fluid `clamp()`.

### One worked example

For `B = 14`, `r = 1.333`, pick **Heading 2 (+2)** and `M = 16`:
`r_pin = 1.333 * (14/16)^(1/2) = 1.246907324142416`.
Heading 2 stays **25 → 25px**; body grows **14 → 16px**; Display 1 shrinks
**79 → 60px**. A stored `1.2469` produces the same generated tokens for this example.
This illustrates the rule; it is not a theme-specific prescription.

### Base and mobile environment

- Sixteen is a reference-pixel minimum: step 0 is `1rem` when `M = 16`.
  Preserve document-root preferences, zoom, reflow, and independent input safeguards.
- Mobile is `(width < 768px) and (pointer: coarse)`: layout viewport below the
  effective `widthBreakpoints.md`, exclusive, AND a coarse primary pointer.
- [AST-012][adaptations] governs custom md and inheritance. No width-only, OR,
  `hover`, `any-pointer`, or UA substitute. Use identical SSR markup.

### Platform support

- Inherit [AST-013][platform]; this rule raises no browser floor.
- Nonmatching environments retain normal typography; unsupported paths must remain usable.
- Rendered claims need browser evidence; iOS claims require actual iOS Safari.

## Current-state impact

The explorer fixes `B = 14` and offers eight ratios (lines 38–46, 96, 405).
Its recommendation is **advice**, not automatic selection: initial state is
Lift with pin +3; the [“Recommended” badge and “Use” button][ui]
expose the lookup separately. Neither initial state overrides this table.

This draft promotes that recommendation into an authoring default. It leaves
[theme application][application], token, authoring, and compilation ownership
intact; only the `typography`/`theme` guides would describe the adopted rule.
No family/contributing contract, source, theme, token, or current authority changes here.

## Verification

| Contract       | Verification                                        | Representative states                                  | Mutation or failure expectation                             |
| -------------- | --------------------------------------------------- | ------------------------------------------------------ | ----------------------------------------------------------- |
| FR1–FR4        | Compare target lookup with the source branches      | Eight picker ratios; either side of 1.25/1.414         | Wrong inclusivity, √2 substitution, or fixed +6             |
| FR2, FR4, FR10 | Compare formula and generated tokens                | Generic B=14; B=16/20; stored vs full precision        | Wrong anchor, base, or serialization drift                  |
| FR5, FR8, FR11 | Check constraints and missing-role behavior         | Failed minima; absent display; invalid/nonfinite input | Silent re-anchoring, inverted ladder, or hidden failure     |
| FR3, FR7, FR9  | Check activation, SSR, and distribution parity      | Narrow/wide × coarse/fine; runtime/built/copied        | OR, late correction, changed markup, or inconsistent tokens |
| FR6, FR12      | Check preserved identity and existing compatibility | Explicit overrides; package changes if any             | Lost author intent or bypassed current ownership            |

These are criteria, not a claim that implementation or device tests ran.

## Decision log

### DEC-1 — Keep the document root independent

**Reference:** `spec:AST-049/DEC-1`
**Decider:** Pending human approval.
Use a theme base minimum; reject a document-root reset.

### DEC-2 — Let desktop ratio choose the target

**Reference:** `spec:AST-049/DEC-2`
**Decider:** Pending human approval.
Adopt +6/+2/+1 by the table; reject fixed Display 1 or theme-name special cases.

### DEC-3 — Keep environment separate from anchor choice

**Reference:** `spec:AST-049/DEC-3`
**Decider:** Pending human approval.
Width and primary pointer activate the profile; neither chooses its anchor.

### DEC-4 — Report constraints rather than silently re-anchor

**Reference:** `spec:AST-049/DEC-4`
**Decider:** Pending human approval.
Keep the ratio lookup stable; reject automatic target changes to conceal floor failures.

### DEC-5 — Keep explicit author intent

**Reference:** `spec:AST-049/DEC-5`
**Decider:** Pending human approval.
Use a virtual step if the named role is absent; alternative targets remain explicit overrides.

## Open questions

- **OQ1 — Adopt the wider input domain?** (human-design) The picker demonstrates
  eight ratios at B=14, not every possible input. Recommend the same three
  branches for finite `B > 0`, `r > 1`, with the stated feasibility/parity checks;
  do not invent extra thresholds without evidence.

[choice]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx#L38-L99
[calculation]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx#L101-L174
[ui]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/apps/sandbox/src/app/(sandbox)/pages/mobile-type/page.tsx#L531-L575
[pr]: https://github.com/facebook/astryx/pull/6699
[adaptations]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-012/spec.md
[application]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/architecture/theme-application.md
[platform]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-013/spec.md
[compatibility]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-017/spec.md
