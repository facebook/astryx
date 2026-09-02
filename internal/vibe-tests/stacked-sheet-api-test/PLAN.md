# Stacked-sheet API vibe test

**Status:** experiment design + machine-readable scaffold; no model runs yet
**Candidates:** Silk-style declarative membership, Drawer-style implicit siblings,
controlled ordered IDs, controlled ordered IDs with explicit interaction policy
**Related:** [BottomSheetStack #5813](https://github.com/facebook/astryx/pull/5813),
[Drawer stack #5652](https://github.com/facebook/astryx/pull/5652),
[`../README.md`](../README.md) Checker Protocol

## 1. Question

Which public API lets an unfamiliar coding agent build and later modify stacked
bottom-sheet flows most reliably, with the least corrective work, while preserving
stack order, scope, state, focus, dismissal, and accessibility?

This experiment deliberately separates two decisions:

1. **Core state model:** declarative sheet membership, implicit sibling order, or an
   explicit ordered stack.
2. **Interaction-policy surface:** whether modality, scrim paint, and final focus need
   first-class props or should remain coupled/defaulted.

The policy-only prompts are reported separately. They must not be pooled into the
core ergonomics score, or the richer candidate wins merely because it has more
capabilities.

This is a **consumer API** experiment. It does not measure library implementation
complexity, bundle size, or which visual treatment is preferred; those require a
separate engineering review because all four fixtures intentionally share one
private runtime and one appearance.

## 2. Conditions

The machine-readable matrix is [`conditions.json`](conditions.json). Every sandbox
installs the same package name and component family. Only the public declarations,
runtime adapter, and consumer docs for the stacked-sheet API vary.

| ID                     | Shape                                                     | Source idea          | State and ordering                                                       |
| ---------------------- | --------------------------------------------------------- | -------------------- | ------------------------------------------------------------------------ |
| `c1-declarative-root`  | `BottomSheetStack.Root` groups ordinary controlled sheets | SilkHQ               | one boolean per sheet; opening chronology determines order within a root |
| `c2-implicit-siblings` | independent sibling `BottomSheet`s, no stack root         | Drawer #5652         | one boolean per sheet; a registry infers global last-opened order        |
| `c3-ordered-ids`       | `BottomSheetStack openSheetIds` + `sheetId` children      | original #5813       | one explicit bottom-to-top array                                         |
| `c4-ordered-policy`    | ordered IDs plus `modality`, `hasScrim`, `finalFocusRef`  | final recommendation | explicit array plus independent interaction policy                       |

No condition is named "recommended", "modern", "simple", or "control" in the
agent-visible sandbox. Setup randomly maps these IDs to opaque labels on every
experiment, and the evaluator receives only that opaque label.

## 3. What remains identical

Each condition receives:

- the exact same product prompt, model, persona, timeout, and output contract;
- the same Astryx components other than the BottomSheet subpath;
- documentation with the same sections and behavioral promises;
- one common visual/runtime engine beneath a thin public-API adapter;
- identical sheet markup, tokens, motion, and accessibility behavior when used
  correctly;
- no repository source, PR body, comparison table, expected component list, or other
  answer leak.

Sandboxes live outside the repository. Packages are copied, not linked back to the
checkout, so agents cannot discover the other candidates or this plan by walking up
the filesystem.

## 4. Fixture architecture

Phase 1 builds four installable copies of `@astryxdesign/core/BottomSheet`.

```text
shared private runtime
  ├── dialog host + scrim
  ├── stack-order engine
  ├── focus/dismissal policy
  ├── panel geometry + motion
  └── instrumentation hooks
          ↑
  c1 adapter   c2 adapter   c3 adapter   c4 adapter
```

The runtime is intentionally not part of the score. Its adapters expose only the API
in the matching file under [`variants/`](variants/). Differences intrinsic to a
candidate stay real:

- C1 has an explicit root but independently controlled sheets.
- C2 has no grouping primitive, so unrelated-stack interference is a valid API
  outcome rather than something the fixture secretly fixes.
- C3 and C4 have an explicit ordered value and controller-local scope.
- Only C4 offers independent modality/scrim policy and explicit final focus.

All four runtimes emit the same private probe attributes so Playwright can evaluate
behavior without understanding the candidate syntax. These attributes are omitted
from agent docs and types.

## 5. Prompt battery

[`prompts.json`](prompts.json) contains eight user-outcome prompts. Prompt text never
names a prop, component, state shape, or candidate. Evaluation metadata is not placed
in the agent prompt.

### Core track

1. two-level drill-down with Back and Close all;
2. three levels with form and scroll state preserved;
3. branching children where only one branch may remain above its parent;
4. two unrelated stacks rendered in the same application;
5. URL/deep-link initialization and browser-style back navigation;
6. a conditional/dynamic record disappearing while a child is open.

### Policy track (reported separately)

7. modal behavior without visible dimming;
8. visual dimming while the page remains interactive, plus deterministic focus return.

`ss-4` and `ss-5` are holdouts during API iteration. Do not tune docs or adapters
against them; use them only for confirmation.

## 6. Two protocols

### 6.1 One-shot generation — primary

A fresh context-free agent receives one prompt and writes one self-contained TSX
file. Run every `condition × prompt × repetition` cell, round-robin across conditions.

Pilot:

```text
conditions: all four
prompts: ss-1, ss-2, ss-3, ss-7
repetitions: 3
runs: 48
```

Confirmation:

```text
conditions: all four
prompts: all eight
repetitions: at least 5 (10 when leading confidence intervals overlap)
models: at least one strong and one mid-tier coding model
```

### 6.2 Change request — secondary

For `ss-1`, `ss-2`, and `ss-4`, preserve the initial conversation and issue the
prompt's `followUp`. Capture both snapshots. This tests whether the API remains
comprehensible when a realistic requirement arrives after the first implementation.
Do not mix this result into one-shot completion; report modification success and
change cost separately.

## 7. Agent output contract

The common runner asks for:

- one default-exported React component in `output.tsx`;
- no prose in that file;
- optional metadata listing docs read;
- no required test IDs or API-specific helpers.

Prompts specify visible labels. Drivers locate controls by role and accessible name,
not by implementation selectors. Private runtime probe attributes are used only to
inspect layer depth, inertness, and presentation state.

## 8. Evaluation

[`rubric.json`](rubric.json) is preregistered and condition-blind.

### 8.1 Qualification gates

A run is complete only when all three pass:

1. exact candidate TypeScript declarations compile it;
2. it renders with no console/runtime error;
3. it uses the installed BottomSheet family rather than a hand-built dialog/overlay.

### 8.2 Critical behavioral probes

Prompt-specific Playwright drivers verify the user-visible contract:

- requested sheet sequence opens in the right order;
- every covered sheet remains painted but is `inert`, `aria-hidden`, and not hit-testable;
- only the top sheet handles Escape, scrim, swipe, Back, and Close as requested;
- popping one level restores the covered sheet and its focused control;
- root close restores focus safely;
- entered values, selection, and scroll state survive cover/uncover;
- independent stacks do not change each other's depth or dismissal order;
- initial/deep-linked state presents the right stack before interaction;
- rapid append/pop converges without a blank or duplicate layer.

Policy prompts additionally verify modality and scrim independently.

### 8.3 Accessibility

Run axe plus deterministic checks for:

- one accessible name on the active dialog boundary;
- no focusable descendant in covered sheets;
- exactly one active layer in the accessibility tree;
- no focus escape from a modal stack;
- no focus stealing from unrelated page content by a non-modal stack.

### 8.4 Friction and maintainability

Measure rather than subjectively score:

- completion rate and all-critical-probes rate (Wilson 95% CI);
- agent duration, input/output tokens, docs read, and compile attempts;
- final lines of code, state declarations, callbacks, and maximum state spread;
- invalid props/components and correction count from output snapshots;
- hand-written overlay machinery (`dialog`, `inert`, z-index, transform, focus trap);
- follow-up lines changed, regressions introduced, and follow-up completion rate.

Use the existing universal evaluator for general code quality, but the decision is
anchored on compilation and runtime behavior—not aesthetics or a preferred state
shape.

## 9. Fairness guards

Before every run, `smoke-test.mjs` verifies:

- all four variant docs exist and cover the same capability checklist;
- prompt text contains no candidate API identifiers;
- expected behavior remains evaluation-only;
- condition IDs do not occur in the rubric;
- prompt and condition IDs are unique;
- the core and policy tracks stay separate.

Additional harness invariants:

- evaluator input strips the condition mapping;
- variant docs target the same length band (flag outside ±20%, review outside ±10%);
- run order is randomized and interleaved;
- each repetition uses a fresh agent session;
- no result is discarded except a preregistered infrastructure failure;
- scoring rules are frozen before the first model run.

## 10. Analysis and decision rule

Report core and policy tracks independently.

A candidate qualifies for the core decision only if:

- TypeScript completion is at least 90%;
- no critical accessibility regression appears;
- every core prompt has at least one successful repetition;
- the lower Wilson bound for all-critical-probes is not below 70% at confirmation.

Among qualifiers:

1. choose the highest all-critical-probes rate;
2. if 95% intervals overlap, choose lower median correction count;
3. if still tied, choose lower median output tokens and code state spread;
4. if still tied, prefer the smaller public API surface.

C4's policy props are adopted only if it materially improves the policy track without
reducing core completion or increasing median core output by more than 10%.

A single aggregate score is included for visualization only; it cannot override a
failed critical behavior or accessibility gate.

## 11. Failure taxonomy

Classify each failed run once at its earliest causal failure:

- `discovery`: did not find the intended stack component;
- `syntax`: found it but used an invalid public shape;
- `state-model`: order/back/branching state is wrong;
- `scope`: unrelated stacks interfere;
- `dismissal`: more than the top layer closes or the wrong action occurs;
- `focus`: focus is lost, trapped incorrectly, or stolen;
- `persistence`: covered state is reset or content unmounts unexpectedly;
- `policy`: modality and paint cannot be expressed as requested;
- `escape-hatch`: hand-built overlay logic replaces the design-system API;
- `infrastructure`: harness/runtime failure; excluded under the preregistered rule.

## 12. Phases

1. **Design scaffold (this change):** conditions, prompts, contract drafts, rubric,
   and no-LLM invariant test.
2. **Fixture runtime:** one shared implementation plus four adapters and declaration
   sets; mutation tests prove visual/behavioral parity for shared capabilities.
3. **Driver:** isolated runner, typecheck, browser probes, transcript/snapshot capture,
   and aggregate report.
4. **Pilot:** 48 runs; fix only harness defects, never candidate docs based on outcomes.
5. **Confirmation:** full battery with holdouts, K≥5, two model tiers.
6. **Decision:** publish per-prompt evidence and choose—or declare no meaningful
   winner.

## 13. Local verification

This design stage has no model cost:

```bash
node internal/vibe-tests/stacked-sheet-api-test/smoke-test.mjs
```
