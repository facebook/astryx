# BottomSheetSwitcher Night Watch audit evidence

- Component: `core/BottomSheetSwitcher`
- Mode: Night Watch `N`
- Rubric: `1.16`
- Baseline: [`4a31578d288df665a1ceabab296d430f6e361cb5`](https://github.com/facebook/astryx/commit/4a31578d288df665a1ceabab296d430f6e361cb5)
- Audited exact head: [`311a003b7af977c375c6b27bb972faf8f39e5c35`](https://github.com/facebook/astryx/commit/311a003b7af977c375c6b27bb972faf8f39e5c35)
- Pull request: [#6184](https://github.com/facebook/astryx/pull/6184)
- Before: **71.3 / C**
- After: **80.8 / C**

The before browser arm is the untouched baseline. Its audit-only clipping fixture is recorded in [`before/baseline-harness.diff`](before/baseline-harness.diff). Every regular browser frame has a sibling sensor receipt binding the story, globals, media, viewport, semantic state, and repository head.

## Scorecard

| Section | Weight | Before | After | Post-fix evidence and remaining gap |
| --- | ---: | ---: | ---: | --- |
| Accessibility | 16 | 3.0 | 4.5 | Nested Escape ordering and platform-close arbitration now use the shared stack. Naming, modal focus containment/return, inert retained panels, purpose gating, IME protection, and a 24px-tall drag region are covered. The shared BottomSheet scroll-region finding remains outside this component. |
| Theming | 14 | 4.5 | 4.5 | Values are tokenized and sheet paint delegates to `bottom-sheet`. The switcher-owned native backdrop still has no public theming target; adding one requires API ownership. |
| API | 14 | 3.0 | 3.0 | Ref, DOM/ARIA/data/events, class, style, and `xstyle` reach the shared dialog with deliberate precedence. `hasScrim` still couples scrim paint, modality, focus, scroll locking, page availability, and hosting (BLOCK; compatibility decision required). |
| Behavior | 12 | 3.0 | 3.0 | Selection, every transition phase/order, dismissal policy, unmount, stale gesture, and focus lifetime are covered. The non-modal `show()` + page-level z-index path remains a BLOCK under AST-027. |
| Design, objective | 6 | 4.5 | 4.5 | Geometry and paint use shared tokens and transform/opacity motion. BottomSheetPanel’s bespoke exit easing/reduced-motion timing remains a shared-owner advisory, not duplicated against the switcher. |
| Design, rendered | 4 | 4.5 | 4.5 | Sixteen Chromium frames cover three steps, handoff, two height modes, modal/no-scrim, light/dark, Matcha, RTL, 320px, and reduced motion. The audit makes no intended visual change; the viewed pairs remain equivalent and the pixel report records raster/timing deltas. |
| Testing | 8 | 4.0 | 4.5 | Two public-seam cases were red against the baseline and green after; 37 focused component/family tests pass. Stories now open the actual component for visual/a11y checks and add a narrow surface. |
| Code health | 8 | 3.0 | 3.0 | Shared dismissal now uses one owner and logical depth. Focus still moves from an Effect in the switcher item path (BLOCK), and the large inline transition state machine remains a FIX-level boundary gap. |
| Docs | 8 | 3.0 | 4.5 | Adds the observational contract, closed anatomy, explicit ref/cancel docs, two do/don’t examples, modal APG guidance, a bare-fence source example, live story plays, narrow coverage, and a non-showcase block. |
| i18n / RTL | 5 | 4.0 | 5.0 | Source and rendered evidence use logical layout and block-axis-only motion; a checked-in verified-N/A reason closes the previous RTL coverage gap. |
| Responsive | 5 | 4.5 | 5.0 | Chromium proves the active panel stays within a 320 CSS px viewport; a narrow story now keeps this state reachable to automated checks. |

Weighted score: **71.3 → 80.8**. Three retained BLOCKs cap the final grade at **C**. If those three root causes were fixed and only their section ceilings lifted to the current non-BLOCK anchors, the projection would be **89.4 / B**.

## Closed public-surface inventory

| Surface or transition | Source seam | Test / docs | Browser evidence | Authority or standard | Result / gap |
| --- | --- | --- | --- | --- | --- |
| Public switcher API and dialog surface | `BottomSheetSwitcher`, props, ref, inherited dialog inputs | component tests, docs, draft contract | modal/no-scrim frames | public component API architecture | Covered; `hasScrim` coupling remains a compatibility-owned BLOCK. |
| Child sheet API | `sheetId`, label, height, snap points, purpose, panel ref/BaseProps | BottomSheet + switcher tests/docs | three active steps, hug/capped | BottomSheet owner + current source | Covered; non-matching/duplicate identifier behavior remains an owner question. |
| Controlled host state | closed/open, modal `showModal()`, non-modal `show()`, live mode change | component tests | modal/no-scrim frames | current source and docs | Covered; non-modal hosting remains the AST-027 BLOCK. |
| Selection and transition phases | entering, active, covered, aligning, fading, exiting, hidden | 26 switcher tests | settled steps + paused handoff | current source/tests | Covered. |
| Handoff ordering | first open, close, equal/taller, shorter alignment, either completion order, rapid replacement | transition tests | handoff light/dark | current source/tests | Covered. |
| Dismissal policy | info/form/required × Escape/platform close/scrim/swipe | component tests + family contract | modal/no-scrim | `family:overlay-dismissal` | Shared-stack violation fixed; retained local policy covered. |
| Focus, naming, and lifecycle | derived/explicit label, modal trap, return, unmount, nested context, stale gesture | component tests | sensor-bound focus and labels | accessibility contract | Covered; Effect-owned focus remains C3 BLOCK. |
| Theming anatomy | transparent shared dialog, delegated BottomSheet panels, switcher scrim | docs + draft contract + theming checks | Neutral light/dark + Matcha | component-theming architecture | Delegation covered; scrim reachability remains a FIX. |
| RTL and responsive behavior | block-axis motion, logical geometry, 320px width | curated RTL reason + stories | RTL and 320px frames | WCAG 1.4.10 + RTL procedure | Covered. |
| Consumer learning surface | source example, `.doc.mjs`, hero + example blocks, Storybook | docs/type/docsite checks | opened stories | docs rubric | Gaps fixed. |

The inventory is closed over exported types, documented concepts, reachable public states and transitions, and implementation branches reachable from those surfaces. Draft-only claims clear no finding.

## Objective remediations

| Defect | Before proof | After proof |
| --- | --- | --- |
| A nested layer inside a non-modal switcher lost the first Escape to the host | [`before/focused-tests-red.txt`](before/focused-tests-red.txt) | [`after/focused-tests.txt`](after/focused-tests.txt) |
| A platform close targeting a lower switcher bypassed topmost-layer ownership | [`before/focused-tests-red.txt`](before/focused-tests-red.txt) | [`after/focused-tests.txt`](after/focused-tests.txt) |
| Component contract was missing | source/docs inventory | schema-v3 `BottomSheetSwitcher.spec.md` + knowledge check |
| Consumer anatomy, explicit props, accessibility guidance, source example, and non-showcase example were incomplete | baseline source inventory | exact-head docs, block, typecheck, and docsite tests |
| Story audits only saw the closed opener and lacked a narrow case | baseline stories | exact-head open-state plays, narrow story, component axe, and frames |
| RTL audit had an unexplained all-N/A gap | [`before/rtl-audit.txt`](before/rtl-audit.txt) | [`after/rtl-audit-report.json`](after/rtl-audit-report.json) |

## Retained findings and manual boundaries

1. **BLOCK — B14 / AST-027.** `hasScrim={false}` still uses `dialog.show()` plus page-level `z-index: 1000`; a transformed clipping ancestor can make the entire sheet unreachable. See [`open-blocks/non-modal-clipping__neutral-light-ltr.png`](open-blocks/non-modal-clipping__neutral-light-ltr.png) and its sensor receipt. The required Layer/top-layer migration is broader and potentially compatibility-affecting.
2. **BLOCK — public API ownership.** `hasScrim` controls scrim paint, modality, focus containment, scroll lock, page availability, and hosting. Separating these released semantics requires an owner-approved API and migration decision.
3. **BLOCK — C3.** The switcher-specific BottomSheet item path moves focus from an Effect. Replacing that lifecycle mechanism must preserve controlled handoffs and focus stability and is outside this focused audit.
4. **FIX — theming reachability.** The switcher-owned native backdrop has no public target. Adding one is a public theming API decision.
5. **FIX — state-machine boundary.** The independently nameable handoff state machine remains embedded in the component rather than behind a focused hook/utility boundary.
6. **Manual API gap.** Safe behavior for a non-matching or duplicate child `sheetId` is not settled.

Shared/systemic observations are not scored twice: BottomSheetPanel’s visible drag pill measures below 3:1 in the audited themes and belongs to the BottomSheet owner; Matcha supporting text measured 4.41:1 and remains the known token-layer contrast class tracked by the existing system issue.

Open [#5813](https://github.com/facebook/astryx/pull/5813) edits controller routing for a proposed sibling stack, and [#6042](https://github.com/facebook/astryx/pull/6042) is draft Stack-only authority. This audit neither copies those proposals nor claims they settle Switcher behavior.

## Validation

- Red-first public-seam proof: **2 expected failures before**, **2 passes after**.
- Focused BottomSheetSwitcher + layer-family tests: **37 passed**.
- Knowledge, sync, changeset, export, Core docs, Storybook type, and docsite checks: pass.
- Component axe: **4 opened stories, 0 violations**. Curated RTL: **1 verified N/A, 0 gaps, 0 stale entries**.
- Chromium: **16 exact-head after frames** plus the retained clipping proof, each with a sensor receipt; before/after pixel deltas are recorded separately because timed handoff position and browser rasterization vary between captures.
- Representative contrast is stored in [`after/contrast-measurements.json`](after/contrast-measurements.json); shared/systemic failures are identified above rather than scored against the switcher.
- The full local suite was attempted at both heads. The exact head reported 14 failures in 8 unrelated macOS/timing-sensitive files; the newly appearing DateTimeInput and SideNav failures both pass in isolation (39/39 and 194/194). Exact-head GitHub checks are summarized in the pull request.
