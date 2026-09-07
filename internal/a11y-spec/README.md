# @astryxdesign/a11y-spec

Reusable accessibility spec tests: one standards-traceable contract per adopted
widget pattern, bound to the components that implement it. **Internal and
unpublished.**

Authored under [`docs/specs/AST-020`](../../docs/specs/AST-020/spec.md)
(how a contract is written) and
[`docs/specs/AST-021`](../../docs/specs/AST-021/spec.md)
(how existing component tests migrate into one). Read those first; this file
explains the code that implements them.

## Why a contract instead of more component tests

Every component that adopts the APG switch pattern owes the same things: the
control is reported as a switch, it has a name that does not change when the
state does, its on/off state is exposed and matches what is rendered, pointer
and keyboard both turn it on and back off, a press slid off and released
elsewhere is taken back, focus stays put when the state changes, and focus can
reach the control and leave it. Writing that per component means reinterpreting
WCAG and the APG each time, and the interpretations drift.

So the pattern is written once, as data, and components bind to it. A binding
says which states it has and what each state is supposed to be; the contract
asks the browser what it actually exposes.

## Shape

```
src/
├── contract.ts    Expectation, PatternContract, definePattern (the schema gate)
├── checklist.ts   the completeness dimensions every pattern must answer
├── harness.ts     the Harness/Subject seam and the evidence-layer vocabulary
├── run.ts         runBinding — applicability, unrun layers, known failures
├── report.ts      separate facts, and the gate over them
├── harness/
│   ├── jsdom.ts       observes unit + DOM. Refuses everything above.
│   └── chromium.ts    observes DOM + accessibility tree + real browser.
├── storybook.ts   a static server over a built Storybook, for the browser lane
└── patterns/
    ├── switch.ts             the switch pattern
    ├── switch.fixtures.ts    conforming + deliberately violating fixtures
    ├── switch.jsdom.test.ts  the contract's own proof, DOM layer
    └── switch.chromium.spec.ts  the same proof in a real engine
```

## Evidence layers are the load-bearing idea

An expectation names the layer that characterizes its claim, plus — in
`alsoNeeds` — any further layer its own body reads. An interaction expectation
is the usual case: "clicking turns it on" is a real-browser claim, but reading
the resulting state is an accessibility-tree observation, so it needs both. A
harness declares which layers it can observe, and the runner will not run an
expectation whose layers a harness cannot all see — it reports `unrun`, naming
the ones that were out of reach.

That is why the jsdom lane is small. jsdom renders markup; it does not compute
an accessibility tree, resolve a real tab sequence, or turn a key press into an
activation. Reporting those as passes because the attributes look right is the
exact failure [`AST-009`](../../docs/specs/AST-009/spec.md) is written against,
so this package reports them as unrun instead and proves them in Chromium.

| Status            | Meaning                                               | Gates                              |
| ----------------- | ----------------------------------------------------- | ---------------------------------- |
| `pass`            | the outcome was observed                              | —                                  |
| `fail`            | the outcome was absent                                | when the expectation is `required` |
| `known-failure`   | the exact recorded historical failure, still failing  | no                                 |
| `unexpected-pass` | a recorded failure that now passes; delete the record | yes                                |
| `not-applicable`  | this state cannot change the outcome                  | —                                  |
| `unrun`           | a layer this expectation reads was out of reach here  | —                                  |

No status is averaged into another, and there is no score. A pattern with one
required failure is not "mostly conformant" (AST-021 FR11).

## Authoring a pattern

1. Read the APG pattern and the WCAG success criteria it supports.
2. Write the expectations. Each needs a stable id, a user outcome in plain
   language, exact sources, an applicability condition, an evidence layer (plus
   `alsoNeeds` for any further layer its body reads), and an enforcement class.
   `definePattern` refuses anything less.
3. Answer every completeness dimension in `checklist.ts` — either an expectation
   names it in `covers`, or the pattern exempts it with an owner, a verification
   method, and a real reason. A criterion the pattern owns only part of takes
   both: the expectation, plus an exemption marked `coversRemainderOnly` naming
   who holds the rest, so the encoded half never implies the whole.
   `unansweredDimensions` lists what is left, and the pattern's suite asserts
   that list is empty.
4. Write a conforming fixture per state and a violating fixture per expectation,
   then prove each expectation fails against its own violation. An expectation
   nobody has watched fail is a claim, not a check (AST-020 FR11).

`required` is earned by a directly applicable WCAG 2.2 A/AA criterion, or by a
current Astryx record adopting the outcome — never by how easy the check was to
write. "Directly applicable" means the criterion is the expectation's PRIMARY
source: a supporting citation further down the list is not adoption, or any
expectation could buy a gate by appending a plausible criterion. Everything else
is `advisory` and has to say why.

## Binding a component

A binding lives with the component:

```
packages/core/src/Switch/__tests__/
├── Switch.a11y.states.ts          which states exist and what each declares
├── Switch.a11y.known-failures.ts  what does not work yet, exactly
├── Switch.a11y.test.tsx           the jsdom lane
└── Switch.a11y.chromium.spec.ts   the Chromium lane, over checked-in stories
```

The binding designates its own subject — by role for a conforming component, by
a fixture-owned hook for a deliberately violating fixture — so a mutation flips
exactly the expectation under test instead of making the subject unfindable.

Component-specific behaviour does not move: callbacks, form data, composition,
and styling stay in the component's own suite (AST-021 FR5).

## Known failures

A known failure names one expectation, one binding, one state, one evidence
layer, the user impact, a public issue, and why the migration is not the place
to fix it. It still runs, it still fails, and it is reported as debt. A
different message, another state, or a wider failure fails the build anyway, and
an expectation that starts passing is reported as an unexpected pass so the
stale record is deleted (AST-021 FR8–FR10).

## Running

```bash
# jsdom lane — part of `pnpm test`
pnpm vitest run --project node internal/a11y-spec
pnpm vitest run --project ui packages/core/src/Switch

# Chromium lane — needs a browser and a built Storybook
pnpm storybook:build
npx playwright install chromium
pnpm test:a11y-contract
```

## What this package does not claim

It does not report what an assistive technology says. Speech, braille,
announcement timing and order, virtual-cursor entry, and known AT/browser
divergence are the real-AT layer, and they are governed by
[`AST-009`](../../docs/specs/AST-009/spec.md), not by anything here. It also
does not replace axe, the visual gate, or manual review: contrast, target size,
forced colors, and motion are measured from pixels, and every pattern records
who owns them instead of pretending otherwise.
