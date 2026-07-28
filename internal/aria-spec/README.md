# @astryxdesign/aria-spec (internal, unpublished)

Reusable [WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/patterns/) conformance
contracts for Astryx components. **Private — never published to npm.**

Encodes each APG pattern **once** as a data-driven contract of prioritized
expectations, then binds components to it. Answers "which APG patterns are fully
covered, across which components?" with a coverage matrix instead of assertions
scattered across ~120 component test files.

## Architecture

```
src/
├── types.ts              ExpectationPriority, Expectation, PatternContract,
│                         AriaHarness (the runtime seam), AriaElement
├── harness/
│   ├── jsdomHarness.ts   Tier 1 — Testing Library + user-event (fast, every PR)
│   └── browserHarness.ts Tier 2 — @vitest/browser + Playwright/Chromium
│                         (real a11y tree, focus/inert/top-layer, focus-visible)
├── patterns/
│   └── switch.ts         APG "switch" pattern as a contract (reference impl)
├── runner/runContract.ts Runs each expectation in isolation, applies
│                         expectedFailures, collects results
└── report/coverage.ts    pattern × component matrix + 0-100 score + summary
```

### The key idea: one contract, two tiers

Expectations are written against an abstract `AriaHarness`, so the **same
contract** runs in jsdom (fast) or real Chromium (high-fidelity) by swapping the
harness. Fidelity-critical expectations (e.g. the real accessibility-tree
snapshot) only pass in the browser tier; jsdom bindings list them in
`expectedFailures`.

### `expectedFailures` — adoption without a wall of red

A binding declares known gaps by expectation id. Each gap is an explicit,
greppable, reviewable line — not a missing test. A gap that later _passes_ is
surfaced as `unexpected-pass` so stale entries get cleaned up. Burning down
`expectedFailures` is the hardening backlog.

## Writing a binding (Tier 1)

```tsx
// packages/core/src/Switch/Switch.aria.test.tsx
const result = await runContract({
  contract: switchContract,
  component: 'Switch',
  setup: () => {
    render(<Switch label="Notifications" value={false} onChange={() => {}} />);
    return createJsdomHarness();
  },
  teardown: cleanup,
  expectedFailures: ['switch-optionally-described', 'switch-aria-snapshot'],
});
expect(contractHasBlockingFailure(result)).toBe(false);
```

## Running

- **Tier 1 (jsdom):** part of `pnpm test`. Nothing extra to install.
- **Tier 2 (browser):**
  ```bash
  pnpm add -Dw @vitest/browser @vitest/browser-playwright vitest-browser-react
  pnpm exec playwright install --with-deps chromium
  pnpm test:aria-browser
  ```

## Priority → CI gating

| Priority   | APG    | CI behavior         |
| ---------- | ------ | ------------------- |
| `blocker`  | MUST   | **Fails the build** |
| `major`    | SHOULD | Reported in matrix  |
| `minor`    | —      | Reported            |
| `optional` | MAY    | Reported            |

## Spec traceability (convention)

Every expectation traces to a specific normative requirement, so any result is
auditable back to the exact clause it enforces. Two mechanisms, used together:

1. **In the test name.** Each expectation's `description` is prefixed with the
   spec citation via `specLabel()`, so the WCAG/APG number shows up in test
   output and is greppable:

   - `WCAG 4.1.2 Name, Role, Value (A): has a non-empty accessible name`
   - `APG switch-1 Space toggles the switch: Space toggles the switch on when focused`

2. **As a structured property.** Each expectation carries a required
   `criteria: SpecCriterion[]` — a machine-readable list (an expectation may
   enforce more than one). The first entry is the primary criterion used for the
   name prefix.

   ```ts
   {
     id: 'switch-1',
     criteria: [
       {spec: 'apg',  id: 'switch-1', name: 'Space toggles the switch', url: '…'},
       {spec: 'wcag', id: '2.1.1', name: 'Keyboard', level: 'A', url: '…'},
     ],
     // description auto-prefixed → "APG switch-1 …: Space toggles the switch on when focused"
   }
   ```

   The property enables spec-coverage reports ("which WCAG SCs does this pattern
   cover?"); the name keeps it visible at a glance. **Both are required** — a new
   expectation must cite at least one WCAG SC or APG clause.

## Creating a new spec test — principles & checklist

These are the instructions for authoring a pattern contract. They distill the
[design-a11y-review skill](https://docs.google.com/document/d/1CDLTcWhLz9yURp1wjGgemiy_V04TUKdo6aUKvjNK5Ko)
(JoAnne Juett) into automatable checks, grounded in two normative sources:

- **[WCAG 2.2](https://www.w3.org/TR/WCAG22/)** — success criteria (start at 2.2;
  WCAG 3.0 is in progress and may be aligned later).
- **[WAI-ARIA APG](https://www.w3.org/WAI/ARIA/apg/)** — per-pattern roles,
  states, properties, and keyboard interactions.

### Principles

1. **Trace every check to a clause.** No expectation exists without a WCAG SC or
   APG citation (enforced by the required `criteria` property + name prefix,
   above). If you can't cite it, it isn't a conformance requirement.
2. **Two layers of requirements.** Every contract is built from:
   1. **General broad requirements** — apply to _all_ components regardless of
      pattern (e.g. no dangling `aria-describedby` id; accessible name present;
      focus never dropped to `<body>`; interactive target ≥ 24×24px).
   2. **Pattern/role-specific requirements** — the APG roles, states, and
      keyboard set for _this_ pattern (e.g. Space toggles a `switch`).
3. **Level A is required — but not always at the component level.** Some Level A
   criteria are page-level (bypass blocks, page language) and can't be satisfied
   by an isolated component. Encode the ones a component _can_ own; note the ones
   it structurally can't.
4. **Encode or excuse — never skip silently.** For each rubric dimension, either
   write an expectation (citing the clause) or record in the pattern file why it
   doesn't apply. The next reviewer must see it was considered, not forgotten.
5. **Right layer for the check.** Static/DOM facts (name, role, contrast) overlap
   with axe; behavior (keyboard, focus, announcements) is what this suite is for.
   Don't re-implement axe — cover what it can't.
6. **Severity maps to priority.** The skill's Critical/Major/Minor/Best-Practice
   grades map to `blocker`/`major`/`minor`/`optional`, which drives CI gating.

### Completeness checklist

Before a pattern is "done", review it against every row. For the pattern under
review, **encode an expectation** (citing the SC/clause) or **record why it does
not apply**. Rows 1–3 (broad) apply to essentially every component; the rest are
conditional on what the pattern actually does.

| #   | Layer   | Dimension          | What to verify                                                                                                                                 | Typical spec              |
| --- | ------- | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| 1   | broad   | **Name**           | Widget + every interactive part has an accessible name (visible label, `aria-label`, or `aria-labelledby`); no dangling label/description ids. | WCAG 4.1.2, 2.4.6, 3.3.2  |
| 2   | broad   | **Role**           | Correct ARIA role/pattern from the APG; sub-roles present (e.g. `option`, `tab`).                                                              | WCAG 4.1.2 · APG          |
| 3   | broad   | **State**          | Every state (checked, selected, expanded, disabled, invalid, busy…) exposed via ARIA — never color/shape alone.                                | WCAG 4.1.2, 1.4.1         |
| 4   | pattern | **Keyboard**       | Full APG keyboard set, including RTL arrow flipping; no keyboard traps.                                                                        | WCAG 2.1.1, 2.1.2 · APG   |
| 5   | pattern | **Focus**          | Overlays trap + restore focus; focus never dropped to `<body>`; visible ring in every theme; focus not obscured.                               | WCAG 2.4.3, 2.4.7, 2.4.11 |
| 6   | pattern | **Announcements**  | Async changes announce via a live region; no born-with-content live regions.                                                                   | WCAG 4.1.3                |
| 7   | pattern | **Reduced motion** | Entry/exit motion guarded by `prefers-reduced-motion`.                                                                                         | WCAG 2.3.3                |
| 8   | pattern | **Forced colors**  | Painted state (fills, checkmarks, focus rings) survives `forced-colors: active`.                                                               | WCAG 1.4.1, 1.4.11        |
| 9   | broad   | **Contrast**       | Text ≥ 4.5:1 (large ≥ 3:1); UI components / focus indicators ≥ 3:1.                                                                            | WCAG 1.4.3, 1.4.11        |
| 10  | broad   | **Target size**    | Interactive targets ≥ 24×24 px.                                                                                                                | WCAG 2.5.8                |
| 11  | broad   | **i18n**           | Every AT-facing string routes through `useTranslator()`.                                                                                       | — (repo rule)             |

### Tier awareness

Some dimensions can only be truly verified in the browser tier: **contrast**,
**forced-colors**, and **visible focus ring** (rows 5, 8, 9) depend on the CSS
engine and are `expectedFailures` in jsdom. Keyboard, name, role, and state
(rows 1–4) run in both tiers.

### When is a spec test complete?

A pattern contract is complete when: (a) every applicable checklist row has an
expectation or a recorded exemption; (b) every expectation cites a WCAG SC or APG
clause; (c) it's been applied to the relevant core component(s) with any real
gaps captured as `expectedFailures`; and (d) reviewed against this checklist by a
second person.

## Status

Prototype (see facebook/astryx#4112). One pattern authored (`switch`), bound to
`Switch` in both tiers. Follow-ups: `vitest-axe` structural pass, the remaining
~22 patterns, pixel screenshots for focus/contrast states, coverage dashboard.
