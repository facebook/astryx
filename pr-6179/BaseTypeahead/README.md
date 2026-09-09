# BaseTypeahead Night Watch audit evidence

- Component: `core/BaseTypeahead`
- Mode: Night Watch `N`
- Rubric: `1.16`
- Baseline: [`53bc34db7c9dd40c3fe0f0e0f419adaea71a73cd`](https://github.com/facebook/astryx/commit/53bc34db7c9dd40c3fe0f0e0f419adaea71a73cd)
- Audited exact head: [`d539b93eaa472e66bdab154f3c623a26af874189`](https://github.com/facebook/astryx/commit/d539b93eaa472e66bdab154f3c623a26af874189)
- Pull request: [#6179](https://github.com/facebook/astryx/pull/6179)
- Before: **63.4 / D**
- After: **79.4 / C**

The before browser arm used the baseline component source plus the audit-only Storybook harness recorded in [`before/baseline-harness.diff`](before/baseline-harness.diff). Every browser frame has a sibling sensor receipt binding the story, globals, media, viewport, semantic state, and repository head.

## Scorecard

| Section | Weight | Before | After | Post-fix evidence and remaining gap |
| --- | ---: | ---: | ---: | --- |
| Accessibility | 16 | 2.0 | 2.5 | Empty ownership and forced-colors highlight fixed; direct naming and focusable-disabled activation remain BLOCKs. |
| Theming | 14 | 4.5 | 4.5 | Token and target guards pass; result-row, group-heading, and selected-state reachability remain one API-owned FIX. |
| API | 14 | 2.5 | 3.0 | BaseProps passthrough fixed; released package-internal composition props remain a BLOCK pending compatibility direction. |
| Behavior | 12 | 4.0 | 4.5 | Grapheme threshold fixed; focusable-disabled activation is cross-referenced to Accessibility. |
| Design, objective | 6 | 5.0 | 5.0 | Token and geometry rules hold. |
| Design, rendered | 4 | 4.0 | 4.5 | 29 exact-head Chromium frames across light/dark, Matcha, RTL, 320px, and forced colors; representative contrast pairs pass. |
| Testing | 8 | 2.5 | 4.5 | Dedicated tests, story plays, component axe, and curated RTL coverage added. |
| Code health | 8 | 3.5 | 3.5 | Existing state-machine complexity remains; no new unsanctioned Effect was introduced. |
| Docs | 8 | 2.5 | 4.5 | Anatomy, prop coverage, states, example, showcase, and observational draft added. |
| i18n / RTL | 5 | 4.0 | 5.0 | Grapheme counting and curated D4 overlay measurement pass. |
| Responsive | 5 | 1.0 | 5.0 | Long results and fixed-width requests remain inside a 320 CSS px viewport. |

Weighted score: **63.4 → 79.4**. Three retained BLOCKs cap eligibility and keep the PR manual-review-only.

## Closed public-surface inventory

| Surface or transition | Source seam | Test / docs | Browser evidence | Authority or standard | Result / gap |
| --- | --- | --- | --- | --- | --- |
| Exported component and generic item/source types | `BaseTypeahead`, `BaseTypeaheadProps<T>`, `SearchSource<T>` | component docs + observational draft | default | public API architecture | Covered; package-internal composition props remain publicly reachable (BLOCK). |
| Caller-controlled selection | `value`, `onChange` | shared Typeahead/Tokenizer tests | selected result | current source and tests | Covered. |
| Query mutation and callback | input value, `onChangeQuery` | focused + shared tests | default and consumer props | current source and tests | Covered. |
| Query threshold and debounce | `minQueryLength`, `debounceMs` | focused grapheme test | default | i18n character rules | Grapheme defect fixed. |
| Search/bootstrap lifecycle | `search`, `bootstrap`, `cancel`, `hasEntriesOnFocus` | shared overlap/stale/cancel tests | default, results, empty | current source and tests | Covered. |
| Default, custom, grouped result content | `renderItem`, `item.element`, group metadata | shared tests + docs | logical dropdown, custom renderer | documented rendering precedence | Covered. |
| Keyboard, focus, and IME transitions | Arrow, Home/End, Enter, Escape, Tab, composition | shared tests | focused result list | APG combobox pattern | Covered except retained focusable-disabled Enter activation (BLOCK). |
| Busy and result feedback | pending source, `aria-busy`, Spinner, live announcement | shared tests | loading | input-family busy contract | Covered. |
| Completed empty search | `emptySearchResultsText` | focused test + component axe | empty results | APG listbox ownership + axe | Invalid child defect fixed. |
| Native and focusable-disabled states | `isDisabled`, `isFocusableDisabled`, `inputTabIndex` | shared tests + exact retained-red proof | disabled states | accessibility disabled-state contract | Native path covered; focusable-disabled selection remains BLOCK and is already owned by #5999/#6000. |
| Input DOM/ARIA/data/style/events | inherited BaseProps, `inputXStyle`, `xstyle`, class/style | focused passthrough test | consumer props | public API INV5–INV7 | Dropped-prop defect fixed; duplicate styling/identity seams remain a compatibility question. |
| Popup width, anchoring, top layer, dismissal | `menuWidth`, `anchorRef`, Popover | shared tests + draft | narrow, logical LTR/RTL | WCAG 1.4.10 + layer/dismissal authority | Viewport overflow fixed; dismissal delegates to shared layer owners. |
| Size variants | `sm`, `md`, `lg` | stories + shared tests | three size frames in light/dark | current public union | Covered. |
| Theming anatomy | dropdown/empty/item targets and caller input styling | theming guards + draft map | Neutral light/dark + Matcha | component-theming architecture | Existing targets pass; three stable row/group states remain one reachability FIX requiring public API ownership. |
| Consumer guidance | doc metadata, example block, showcase, Storybook | docsite tests | story matrix | current docs conventions | Fixed and covered. |

The inventory is closed over exported types, documented concepts, reachable public states/transitions, and implementation branches reachable from those surfaces. No draft-only claim clears a finding.

## Objective remediations

| Defect | Before proof | After proof |
| --- | --- | --- |
| Supported input props were dropped | [`before/focused-tests-red.txt`](before/focused-tests-red.txt) | [`after/focused-tests.txt`](after/focused-tests.txt) + Consumer Props receipts |
| Visible-character threshold used UTF-16 code units | [`before/focused-tests-red.txt`](before/focused-tests-red.txt) | [`after/focused-tests.txt`](after/focused-tests.txt) |
| Empty listbox owned a generic `div`, not an option | [`before/focused-tests-red.txt`](before/focused-tests-red.txt) | focused test + [`after/a11y-report.json`](after/a11y-report.json) (0 violations) |
| Long result popup crossed the 320px viewport | [`before/frames/narrow-long-result__neutral-light-ltr.failure.json`](before/frames/narrow-long-result__neutral-light-ltr.failure.json) | [`after/frames/narrow-long-result__neutral-light-ltr.png.sensors.json`](after/frames/narrow-long-result__neutral-light-ltr.png.sensors.json) |
| Highlight disappeared in forced colors | [`before/frames/highlighted-option__forced-colors.failure.json`](before/frames/highlighted-option__forced-colors.failure.json) | [`after/frames/highlighted-option__forced-colors.png.sensors.json`](after/frames/highlighted-option__forced-colors.png.sensors.json) |
| Dedicated story, RTL measurement, docs anatomy, and showcase were missing | baseline harness + docs diff | [`after/rtl-audit-report.json`](after/rtl-audit-report.json), docsite tests, and exact-head story receipts |

See [`fix-comparisons.png`](fix-comparisons.png), [`before/contact-sheet.png`](before/contact-sheet.png), and [`after/contact-sheet.png`](after/contact-sheet.png).

## Retained findings and manual boundaries

1. **BLOCK — A1 accessible name.** Direct `BaseTypeahead` remains constructible without `aria-label` or `aria-labelledby`. Requiring a naming prop or adding a default changes public API/default behavior.
2. **BLOCK — A11 focusable-disabled activation.** An open combobox that becomes focusable-disabled still selects the highlighted item on Enter. [`open-blocks/focusable-disabled-red.txt`](open-blocks/focusable-disabled-red.txt) proves the current exact-head behavior. [#5999](https://github.com/facebook/astryx/pull/5999) and [#6000](https://github.com/facebook/astryx/pull/6000) already own the same source fix, so this audit does not duplicate it.
3. **BLOCK — public internal composition surface.** Released `BaseTypeaheadProps` exposes `__queryEntries`, `isFocusableDisabled`, and `inputTabIndex`; removal or admission needs compatibility ownership.
4. **FIX — theming reachability.** Result row, group heading, and outer selected state have no public target. Adding one is a public theming API decision.
5. **FIX — parallel input API seams.** `inputXStyle`/`xstyle`, `inputId`/`id`, and camel ARIA helpers/native ARIA attributes need a compatibility plan rather than audit-time deprecation.
6. **Manual design question.** Bare-input focus-ring ownership remains unsettled between BaseTypeahead and the direct caller wrapper.

Overlapping open PRs must be reconciled before landing. No ordinary per-finding issue was filed.

## Validation

- `pnpm build`, `pnpm storybook:build`, Storybook typecheck: pass at exact head.
- `pnpm lint:strict`: pass with 0 errors and 86 pre-existing repository warnings.
- Focused core/theming tests: **607 passed**; [`after/focused-tests.txt`](after/focused-tests.txt).
- Docsite tests: **495 passed**; [`after/docsite-tests.txt`](after/docsite-tests.txt).
- Component axe: **0 violations**; [`after/a11y-report.json`](after/a11y-report.json).
- Curated RTL: **D4 pass, 1 measured, 0 gaps**; [`after/rtl-audit-report.json`](after/rtl-audit-report.json).
- Chromium: **29 exact-head after frames**, 20 paired non-visual states pixel-identical, forced-colors and 320px fixes shown separately; every frame has a sensor receipt.
- Representative contrast: 7/7 measured pairs pass; [`after/contrast-measurements.json`](after/contrast-measurements.json).

The monorepo-wide local `pnpm test` was attempted twice. It remains red on this Mac for unrelated repository/environment cases (including GNU-only `cp --reflink`, pre-existing story-tree fixtures, and timing budgets); affected exact-head suites are green and the exact-head GitHub `test` check is the authoritative full-suite result.
