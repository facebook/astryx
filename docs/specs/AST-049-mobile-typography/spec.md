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

# First-party mobile typography system spec

## Intent

**Summary**

- This PR changes only this spec. Theme implementation lives in [PR #6699][pr].
- Propose a 1rem reading base only on narrow, primary-coarse viewports.
- Pin preserves each theme's Display 1; root and desktop typography stay unchanged.
- Extra 14px secondary / 12px heading-6 floors are an **open decision**.
- This record is draft, not approval to change code, themes, or tokens.

People should be able to read a narrow touch interface comfortably without
unnecessarily enlarging its biggest headings. This record proposes one shared
first-party profile. [AST-012][adaptations] owns the adaptation mechanism but
explicitly excludes choosing bundled-theme values. Theme identities and root
choices remain package-owned; the tables here project those inputs, not replace
that ownership.

## Non-goals

- Changing `html`/`:root` font-size, desktop scales, or unthemed core defaults.
- Changing font families, weights, tracking, layout, spacing, or input safeguards.
- Adding a mobile API, device detector, or viewport-fluid typography.
- Automatically enrolling independent custom themes or rewriting consumer copies.
- Treating numerical floors as accessibility certification.
- Prescribing private helpers, file layouts, or CI topology; equivalent
  implementations may satisfy the same observable contract.

## Requirements

All requirements below are **proposed**, not current authority.

- **FR1 — First-party scope.** Cover neutral, chocolate, butter, stone, gothic,
  matcha, and y2k. The first four have a 14px-reference base; the last three
  already have a 16px-reference base. Independent custom themes and the
  unpublished probe fixture are outside this default policy. [Theme sources][themes]
- **FR2 — Theme base, not document root.** In matching stock themes,
  `--font-size-base` MUST be `1rem`, with body/label/code/heading-4 at that base.
  The document root MUST remain unchanged. Reference pixels assume a 16px
  root; with a 20px user root, `1rem` renders at 20px. Never counter-scale it.
- **FR3 — Both conditions are required.** Mobile MUST mean narrow AND a coarse
  primary pointer, using the exact boundary and exclusions below.
- **FR4 — Discrete Pin outputs.** Use the formula and endpoint tables below.
  Preserve Display 1 and keep the raw ladder geometric. Do not introduce
  viewport-driven `clamp()` interpolation or a universal display cap.
- **FR5 — Additional floors need approval.** OQ1 proposes semantic minima of
  14px-reference for heading-5/supporting and 12px-reference for heading-6.
  These are not raw-token clamps. The marked table values are an open extension
  beyond #6699, not an implementation task or a shipped guarantee.
- **FR6 — Preserve readable type identity.** Keep existing families, weights,
  tracking, and semantic HTML. Leading MUST remain unitless and match the proposed
  final-size endpoints; a size correction must not retain incompatible leading.
- **FR7 — CSS owns presentation.** Both states MUST work without a typography
  resize handler or React remount. Initial built CSS MUST select the right state
  before hydration; server and first-client markup must agree. Runtime style
  injection alone is not proof of pre-hydration or no-JavaScript behavior.
- **FR8 — Preserve author intent.** Keep AST-012's ordered rules, nested/portal
  boundaries, media-surface precedence, and explicit overrides. A later child rule
  can replace the profile; an empty rule list or root-only override does not erase
  inherited rules. Explicit customizations may bypass the stock semantic floors.
- **FR9 — Distribution and observation agree.** Runtime themes, built CSS/modules,
  and newly copied CLI themes MUST express equivalent output. JavaScript theme
  token reads remain root-value reads. An optional media-query observer defaults
  to false on the server and must not select different content or heading levels.
- **FR10 — Unrelated values stay unchanged.** Preserve nonmatching values,
  literal component sizes, pixel geometry, and independent input safeguards.
  Named `Text size` values remain token-backed and may adapt; they are not fixed
  pixels. The matching supporting-size exceptions are called out below.
- **FR11 — Accessibility is an outcome.** Preserve text preferences, zoom/reflow,
  user spacing, labels, headings, and keyboard access. Larger text may reflow,
  but must not hide essential content or make controls unusable.
- **FR12 — Compatibility remains separately owned.** Later implementation work
  follows the existing released-consumer policy. This spec-only PR makes no
  package change and needs no Changeset.

### When the profile applies

For stock themes, use `(width < 768px) and (pointer: coarse)`.
`narrow` means layout viewport width below the effective `widthBreakpoints.md`.
The stock value is 768 CSS px; the upper edge is exclusive. An inherited custom
md value keeps AST-012's meaning. Do not approximate the edge with 767px.

| Narrow | Primary coarse | Profile             |
| ------ | -------------- | ------------------- |
| Yes    | Yes            | Pin profile         |
| Yes    | No             | Original typography |
| No     | Yes            | Original typography |
| No     | No             | Original typography |

- `hover: none` is neither required nor sufficient; it measures something else.
- `any-pointer: coarse` can match a secondary touchscreen on a fine-primary laptop.
- UA, device names, orientation, and last-input history do not override the query.
- `pointer: none` or a nonmatching pointer query does not activate the profile.

A narrow mouse window stays unchanged. A wide touch tablet or 844px phone
landscape stays unchanged. A 744px coarse-pointer split view matches. All still
need usable responsive layout; this predicate is not a touch-target policy.

### Pin definition and table conventions

For the root base B, ratio r, and raw step k:

```text
M = max(B, 16)
r_pin = r * (B / M)^(1/6)       # Display 1 is step +6
root(k) = Math.round(B * r^k)
mobile(k) = Math.round(M * r_pin^k)
rem = referencePx / 16
```

Use positive-number `Math.round` semantics without intermediate rounding.
The exact ratios are 1.1735887063175583 and 1.2224882357474567; their authored
1.1736 and 1.2225 forms produce identical token maps with the inspected
[scale generator][scale]. These equations define public outputs, not a required
private algorithm; precomputed equivalents are valid.

Gestalt supports a discrete, role-led scale. Its [typography guidance][gestalt]
is supporting research, not the source of Astryx's Pin formula.

Each table covers all fourteen semantic roles, grouping identical endpoints.
Sizes are **desktop → proposed mobile reference px**; divide by 16 for rem.
Leading is the proposed mobile unitless multiplier, rounded to four decimals.
`heading-N` refers to the typography role, not a change to HTML heading levels.

**† OPEN DECISION:** the marked minima require OQ1 approval and go beyond #6699's
pure Pin. The tables show the recommended full profile, not a claim that those
extra values are implemented. All other requirements are also draft proposals.

### A. Neutral and chocolate

Root `14 / 1.2` → matching `16 / 1.1736`; Display 1 stays **42px**.

| Role                         | Desktop → mobile px | Mobile leading |
| ---------------------------- | ------------------: | -------------: |
| display-1                    |             42 → 42 |         1.2381 |
| display-2                    |             35 → 36 |         1.2222 |
| display-3                    |             29 → 30 |         1.4667 |
| heading-1                    |             24 → 26 |         1.3846 |
| heading-2                    |             20 → 22 |         1.4545 |
| heading-3; large             |             17 → 19 |         1.4737 |
| heading-4; body; label; code |             14 → 16 |            1.5 |
| heading-5; supporting        |             12 → 14 |         1.4286 |
| heading-6                    |             10 → 12 |         1.6667 |

Pure Pin already reaches the proposed small-role minima for these two themes.

### B. Butter and stone

Root `14 / 1.25` → matching `16 / 1.2225`; Display 1 stays **53px**.

| Role                         | Desktop → mobile px | Mobile leading |
| ---------------------------- | ------------------: | -------------: |
| display-1                    |             53 → 53 |         1.2830 |
| display-2                    |             43 → 44 |         1.2727 |
| display-3                    |             34 → 36 |         1.2222 |
| heading-1                    |             27 → 29 |         1.3793 |
| heading-2                    |             22 → 24 |         1.3333 |
| heading-3; large             |             18 → 20 |            1.4 |
| heading-4; body; label; code |             14 → 16 |            1.5 |
| heading-5                    |            11 → 14† |         1.4286 |
| heading-6                    |             9 → 12† |         1.6667 |
| supporting                   |            12 → 14† |         1.4286 |

Root supporting is a literal `12px` override, not the raw 11px step.
Pure Pin yields 13px heading-5/supporting and 11px heading-6; the † corrections
are the additional decision. Preserve the literal root value when nonmatching.

### C. Gothic, matcha, and y2k

Root and matching ladder remain `16 / 1.25`; Display 1 stays **61px**.
Only the proposed † semantic floors change.

| Role                         | Desktop → mobile px | Mobile leading |
| ---------------------------- | ------------------: | -------------: |
| display-1                    |             61 → 61 |         1.2459 |
| display-2                    |             49 → 49 |         1.2245 |
| display-3                    |             39 → 39 |         1.2308 |
| heading-1                    |             31 → 31 |         1.4194 |
| heading-2                    |             25 → 25 |           1.44 |
| heading-3; large             |             20 → 20 |            1.4 |
| heading-4; body; label; code |             16 → 16 |            1.5 |
| heading-5                    |            13 → 14† |         1.4286 |
| heading-6                    |            10 → 12† |         1.6667 |
| supporting — gothic/matcha   |            13 → 14† |         1.4286 |
| supporting — y2k             |            12 → 14† |         1.4286 |

Y2K also has a literal `12px` root supporting override. The already-16 base
alone does not satisfy every proposed semantic floor. #6699 does not change
these three themes in the inspected source snapshot.

### Role and layout safeguards

- A role's size and leading use `--text-<role>-size` and
  `--text-<role>-leading`. A floor changes the semantic role, not its raw alias.
- The key reading endpoints are 16px/24px body, 14px/~20px secondary text,
  and 12px/~20px heading-6. Keep unitless leading so text preferences scale it.
- Reserve the smallest heading for brief subordinate headings, not body copy.
- A pinned display can still wrap. Do not shrink it to force a single line.
- No mobile-specific tracking or weight changes are proposed.

### Platform support

- Inherit [AST-013][platform]: its rolling full/reduced tiers and explicit latest
  stable desktop Chrome and iOS Safari support. This profile raises no floor.
- A nonmatching/unavailable predicate leaves normal typography usable. Do not
  guess a device, throw, hide content, or silently waive supported behavior.
- Layout, paint, and hydration claims need real-browser evidence. An iOS claim
  needs actual iOS Safari; Chromium or emulated WebKit does not substitute.

## Current-state impact

This PR adds **one draft specification only**. It changes no code, theme
source, token values, schema, template, or current authority. Related theme
implementation is in #6699; this record does not approve or classify that PR.

At source snapshot `9057ebe308c1625b587927583654f5a2ef391e80`, #6699 contains
geometric Pin for neutral/chocolate/butter/stone. It does not contain the proposed
extra floors for butter/stone or floor-only changes for gothic/matcha/y2k.

If adopted, this policy changes first-party matching defaults and the
`typography`/`theme` consumer guides. The affected architecture records are
`architecture:theme-tokens`, `architecture:theme-authoring-contract`,
`architecture:theme-compilation`, and [theme application][application].
Their existing ownership and mechanisms remain in force; no family or
contributing contract changes. Metadata names proposed affected surfaces,
not code edits made by this PR.

Any later package change follows [AST-017][compatibility]: a compatible `[feat]`
is patch while 0.x; an actual stable-contract break is `[breaking]`/minor with
concrete migration. Visual scope alone does not decide the category.

## Verification

These are conformance criteria, not claims of completed implementation or device
testing. Document/schema and numeric checks are separate from rendered evidence.

| Contract  | Verification                                                              | Representative states                                   | Mutation or failure expectation                                 |
| --------- | ------------------------------------------------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------- |
| FR1–FR2   | Root/default comparison and computed sizes                                | Seven themes; matching and nonmatching                  | Root, core, or desktop values change                            |
| FR3       | Exact query and boundary checks                                           | 767/768/769px; coarse/fine; secondary touch             | OR, inclusive edge, hover/UA/any-pointer substitution           |
| FR4–FR6   | All retained role sizes/leading against the generator and proposed floors | Three scale families; literal supporting exceptions     | Wrong anchor, role, leading, or raw-token clamp                 |
| FR7, FR9  | Initial built CSS, SSR/hydration, runtime/built/copied-source parity      | With/without JavaScript; predicate changes              | Late correction, differing markup, or missing rules             |
| FR8, FR10 | Override and scope checks                                                 | Nested/portal; later child rule; literal vs named sizes | Lost author intent, leaked scope, or unrelated geometry changes |
| FR11      | Browser, script, zoom/reflow, and text-spacing evidence                   | 16/20px root; 200% text; 400% reflow; long labels       | Clipping, lost actions/semantics, or disabled enlargement       |
| FR12      | Released-consumer compatibility review                                    | Supported usage and companion versions                  | A stable break mislabeled as nonbreaking                        |

Record actual query results and computed typography, not just viewport labels or
token strings. For iOS input-focus claims, include real Safari evidence. Keep
font fallback, representative scripts, and keyboard access in the rendered cases.

## Decision log

All entries are **proposed**, not adopted decisions.

### DEC-1 — Keep the root independent

**Reference:** `spec:AST-049/DEC-1`
**Decider:** Pending human approval.

Propose a matching 1rem reading base without resizing the document root.
Rejected: fixed-root resets or changing every desktop theme.

### DEC-2 — Pin rather than interpolate

**Reference:** `spec:AST-049/DEC-2`
**Decider:** Pending human approval.

Propose finite endpoints that preserve Display 1 while improving smaller roles.
Rejected: fluid viewport sizing, a universal cap, or lifting the whole ladder.

### DEC-3 — Require narrow and primary-coarse together

**Reference:** `spec:AST-049/DEC-3`
**Decider:** Pending human approval.

Propose the strict md edge plus primary-pointer capability, not device identity.
Rejected: width-only, pointer-only, OR, hover, secondary-touch, and UA heuristics.

### DEC-4 — Decide semantic floors explicitly

**Reference:** `spec:AST-049/DEC-4`
**Decider:** Pending human design approval; see OQ1.

Recommend the marked secondary/small-heading minima without clamping raw tokens.
Rejected: assuming a 16px base alone makes every semantic role large enough.

### DEC-5 — Keep CSS selection and existing overrides

**Reference:** `spec:AST-049/DEC-5`
**Decider:** Pending human approval.

Propose CSS-owned presentation with unchanged markup and ordered author overrides.
Rejected: a new responsive state owner or server-side device inference.

## Open questions

- **OQ1 — Approve the extra semantic floors?** (human-design) Recommend 14px
  heading-5/supporting and 12px heading-6, including the already-16 themes.
  Pure Pin is a smaller alternative but does not meet those proposed minima.
  The † table values must not be assumed approved or implemented.
- **OQ2 — Does a later implementation break a stable use?** (checkable) Apply
  AST-017 to the actual package changes and supported version combinations.
  Use `[feat]`/patch only if compatible; otherwise `[breaking]`/minor and migration.

[pr]: https://github.com/facebook/astryx/pull/6699
[adaptations]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-012/spec.md
[themes]: https://github.com/facebook/astryx/tree/9057ebe308c1625b587927583654f5a2ef391e80/packages/themes
[application]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/architecture/theme-application.md
[scale]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/packages/core/src/theme/expandTypeScale.ts
[gestalt]: https://github.com/pinterest/gestalt/blob/22874a7522d1803df992fae2bcb31ef42be29519/docs/pages/foundations/typography.tsx
[platform]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-013/spec.md
[compatibility]: https://github.com/facebook/astryx/blob/9057ebe308c1625b587927583654f5a2ef391e80/docs/specs/AST-017/spec.md
