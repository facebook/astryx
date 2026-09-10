# BaseTypeahead Night Watch audit evidence

- Component: `core/BaseTypeahead` (`@astryxdesign/core`)
- Mode: Night Watch `N`
- Rubric: `1.16.2`
- Original audit baseline: [`53bc34db7c9dd40c3fe0f0e0f419adaea71a73cd`](https://github.com/facebook/astryx/commit/53bc34db7c9dd40c3fe0f0e0f419adaea71a73cd), **63.4 / D**
- Re-audited review baseline: [`507f7c203f4e451a2bb50ecd731c850d510271fb`](https://github.com/facebook/astryx/commit/507f7c203f4e451a2bb50ecd731c850d510271fb), **72.4 / C**
- Corrected exact head: [`7af883c1fbea72453fc7dcff771e3a9c4a364601`](https://github.com/facebook/astryx/commit/7af883c1fbea72453fc7dcff771e3a9c4a364601), **77.8 / C**
- Pull request: [#6179](https://github.com/facebook/astryx/pull/6179)

Every final Chromium frame has a sibling sensor receipt binding the story, globals, media, viewport, semantic state, and exact repository head. The machine-readable score and eligibility verdict are in [`scorecard.json`](scorecard.json).

## Re-audited scorecard

| Section | Weight | Before correction | After correction | Result |
| --- | ---: | ---: | ---: | --- |
| Accessibility | 16 | 2.0 | 2.0 | A4 stale post-Escape reopening is now explicitly proven and scored; A1 and A11 remain. |
| Theming | 14 | 4.5 | 4.5 | No affected-row change. |
| API | 14 | 2.5 | 3.0 | P2/P3 native attribute loss fixed; one released-surface BLOCK remains. |
| Behavior | 12 | 4.5 | 4.5 | A4 owns the retained Escape defect; no duplicate score. |
| Design, objective | 6 | 5.0 | 5.0 | No affected-row change. |
| Design, rendered | 4 | 4.5 | 4.5 | 26 standard frames plus one forced-colors frame, all exact-head and inspected. |
| Testing | 8 | 4.5 | 4.5 | Collision/undefined tests and permanent 320px Storybook assertions added. |
| Code health | 8 | 3.5 | 3.5 | Existing state-machine complexity remains. |
| Docs | 8 | 4.5 | 4.5 | Width and retained-behavior claims corrected; fixture surface reduced under X10–X12. |
| i18n / RTL | 5 | 5.0 | 5.0 | D4 remains measured and passing. |
| Responsive | 5 | 1.0 | 5.0 | 320px popup now keeps both gutters and contains all option content. |

Weighted score: **72.4 → 77.8 (C → C)**. Four retained BLOCKs keep the PR manual-review-only and ineligible for unattended merge.

## Corrected review findings

| Finding | Red proof | Final proof |
| --- | --- | --- |
| Undefined legacy aliases erased native `id`, `aria-labelledby`, `aria-describedby`, and `tabIndex` | [`before/native-alias-precedence-red.txt`](before/native-alias-precedence-red.txt) | [`after/focused-tests.txt`](after/focused-tests.txt), 609/609 |
| 320px popup lost one gutter and the long option scrolled 443px inside a 280px row | [`before/viewport-content-red.json`](before/viewport-content-red.json) | [`after/viewport-content-final.json`](after/viewport-content-final.json) and the narrow frame receipt |
| Pending search can reopen after Escape | prior report omitted this retained state | [`after/BaseTypeahead.escape-gap.test.txt`](after/BaseTypeahead.escape-gap.test.txt), expected red at the exact head |
| Focusable-disabled behavior was overstated | retained behavior existed but prose claimed selection was blocked | [`after/BaseTypeahead.focusable-disabled-gap.test.txt`](after/BaseTypeahead.focusable-disabled-gap.test.txt), expected red at the exact head; docs/spec now describe it accurately |
| Fixture surface exceeded the smallest reusable set | separate selected/consumer stories, exhaustive `argTypes`, duplicate showcase implementation | selected state is driven from Default; two stories and exhaustive `argTypes` removed; the existing Custom Search implementation became the hero, with one materially distinct custom-results example retained |

At 320 CSS px, the final listbox is `x=32`, `right=304`, `width=272`, `clientWidth=272`, `scrollWidth=272`; every option has `scrollWidth === clientWidth === 264`.

## Final exact-head validation

- Focused component/theming tests: **609 passed**; [`after/focused-tests.txt`](after/focused-tests.txt).
- Exact-head Storybook build, docsite generation/tests/typecheck, and focused package typechecks: pass; [`after/storybook-build-final.txt`](after/storybook-build-final.txt) and [`after/docsite-final-after-build.txt`](after/docsite-final-after-build.txt).
- Strict lint: **0 errors** (84 unrelated repository warnings); [`after/lint-strict-final.txt`](after/lint-strict-final.txt).
- Docsite: **495 passed**; [`after/docsite-final-after-build.txt`](after/docsite-final-after-build.txt).
- Component axe: **0 violations across all 8 retained stories**; [`after/a11y-report.json`](after/a11y-report.json).
- Curated RTL: **D4 pass, 1 measured, 0 gaps**; [`after/rtl-audit-report.json`](after/rtl-audit-report.json).
- Chromium: **26 standard frames + 1 forced-colors frame**, all sensor-green; [`after/frames/capture-results.json`](after/frames/capture-results.json).
- Representative contrast: **7/7 pass**; [`after/contrast-measurements.json`](after/contrast-measurements.json).
- Full local `pnpm test` on predecessor candidate `af0df71f` (the only later change is block registry composition): **16,112 passed, 33 failed, 45 skipped**. The failures are unrelated Mac/repository-wide fixtures and timing limits (including GNU-only `cp --reflink`, pre-existing story-tree rows, and CLI timeouts); affected exact-head suites are green. See [`after/full-test.txt`](after/full-test.txt). Exact-head GitHub CI is the authoritative full-suite gate.

## Retained BLOCKs and eligibility

1. **A1:** Direct `BaseTypeahead` remains constructible without an accessible name.
2. **A4:** A pending result can reopen the popup after Escape.
3. **A11:** An already-open combobox that becomes focusable-disabled can still select on Enter. [#5999](https://github.com/facebook/astryx/pull/5999) and [#6000](https://github.com/facebook/astryx/pull/6000) already own the source fix.
4. **Public API ownership:** Released `BaseTypeaheadProps` exposes package-internal composition knobs; changing that surface requires compatibility ownership.

Eligibility: **manual-review-only; not eligible for unattended merge**. Auto-merge remains off. The wiki ledger is intentionally untouched; recording happens only after landing under rubric 1.16.2.
