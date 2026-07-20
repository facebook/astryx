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

## Status

Prototype (see facebook/astryx#4112). One pattern authored (`switch`), bound to
`Switch` in both tiers. Follow-ups: `vitest-axe` structural pass, the remaining
~22 patterns, pixel screenshots for focus/contrast states, coverage dashboard.
