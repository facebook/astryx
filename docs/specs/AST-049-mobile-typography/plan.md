---
schema_version: 1
template_version: 1
kind: implementation-plan
id: plan:AST-049
authority: draft
archive_reason: null
superseded_by: null
approved_by: null
approved_at: null
spec: spec:AST-049
owners: [imdreamrunner]
---

# Mobile typography — concise plan

- Draft reading guide to [AST-049](spec.md); no policy is approved here.
- Theme implementation is tracked in [PR #6699](https://github.com/facebook/astryx/pull/6699).
- This spec PR changes no code, theme definitions, or token values.

## Phases

### At a glance

| Topic          | What happens                                                                                                                      |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 16px base      | Matching reading roles use 1rem. Document-root and desktop scales stay unchanged.                                                 |
| Pin            | Preserve each theme's Display 1. Use the [role tables](spec.md#recommended-semantic-pin-tables--fr4fr6), not a second table here. |
| Narrow + touch | Require `(width < 768px) and (pointer: coarse)`; use the theme's effective md breakpoint.                                         |

### PR #6699 checklist

- [ ] Keep the geometric updates scoped to neutral, chocolate, butter, and
      stone. Extra floor-related scope needs the decision below.
- [ ] Confirm base 16 and ratios 1.1736 / 1.2225 for those two theme pairs.
      Keep Display 1 unchanged.
- [ ] Require narrow AND primary-coarse. Exclude the exact md boundary,
      which is 768px for stock themes.
- [ ] Preserve root preferences, nonmatching values, font families, weights,
      explicit overrides, and semantic HTML.
- [ ] Keep theme source and newly distributed CLI copies equivalent.
      Do not silently rewrite existing consumer copies.
- [ ] Test affected raw/semantic sizes, leading, cascade, and predicate cases.
      Compare with the [spec's verification map](spec.md#verification).
- [ ] Use the Changeset category selected by compatibility review.
      Describe intended visual differences and any consumer migration.

## Verification

- [ ] **This spec PR:** knowledge, formatting, and whitespace checks pass;
      approval metadata remains draft.
- [ ] **Theme change:** affected theme tests cover endpoints, overrides,
      and all four narrow/coarse combinations.
- [ ] **Actual iOS Safari:** check reading, input focus, and both sides of
      the portrait/landscape threshold. Emulation is not Safari evidence.
- [ ] **Zoom:** check enlarged root text, 200% text sizing, and 400% reflow.
      Content and controls must remain available without clipping.

The first command checks this spec PR. The other commands belong to the
related theme-change work; listing them does not claim they ran here.

```bash
node scripts/check-knowledge.mjs --base 9057ebe308c1625b587927583654f5a2ef391e80
pnpm exec vitest run --project=node packages/themes
pnpm check:changesets
```

## Status

### Open decisions

1. **Floor approval:** adopt 14px-reference supporting/heading-5 and
   12px-reference heading-6 minima, or keep pure Pin?
   The floors are proposed, not approved, and extend beyond #6699's current
   geometric changes, including effects on already-16 themes.
   No extra theme/token changes are assumed until that decision.
   See the [spec's open questions](spec.md#open-questions).

2. **Changeset class:** does the theme change break a documented stable use?
   If compatible, `[feat]` means patch; a stable-contract break means
   `[breaking]`/minor while 0.x, following the
   [compatibility policy](../AST-017/spec.md).
   This documentation-only PR needs no Changeset.
