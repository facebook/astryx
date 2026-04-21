# XDS Vibe Tests

Structured evaluations that compare how well LLMs generate UI code under different design system configurations. Same prompts, different systems, measurable outcomes.

## Prompt Battery

Prompts live in [`test-sets/default.json`](test-sets/default.json). Each prompt has:

```json
{
  "id": "fwc-6",
  "category": "feature-with-constraint",
  "prompt": "Build a shipping method selector with three options: Standard (free, 5-7 days), Express ($9.99, 2-3 days), Overnight ($19.99, next day)",
  "expectedComponents": ["XDSRadioList", "XDSCard"],
  "complexity": "simple"
}
```

- **`prompt`** — the task given to the agent (identical across all configs)
- **`expectedComponents`** — used for evaluation ONLY, never shown to agents
- **`category`** — groups prompts by type (feature-with-constraint, workflow-description, clone-with-modification, state-display, data-display, responsive-challenge, io-integration, page-setup, typography, theme-customization)
- **`complexity`** — simple, moderate, complex

## Sub-Agent Prompts

Each target gets an equivalent prompt. The only thing that varies is the design system and where to find its docs.

**XDS agent sees:**

```
You are generating React/TSX code using the XDS design system.

Read the package README at node_modules/@xds/core/README.md for how to look up
component docs. Use what you find there to discover the components you need.

## Task

Build a shipping method selector with three options: Standard (free, 5-7 days),
Express ($9.99, 2-3 days), Overnight ($19.99, next day)

## Output

Write the TSX code to: internal/vibe-tests/results/<id>/results/fwc-6.tsx
Write metadata to: internal/vibe-tests/results/<id>/results/fwc-6.json

Metadata: {"completedAt": "<ISO timestamp>", "docsRead": [<component names you looked up>]}
Write ONLY valid TSX. No markdown fences, no explanation.
```

**Baseline (shadcn) agent sees:**

```
You are generating React/TSX code using shadcn/ui components with Tailwind CSS.

Read the baseline docs at internal/vibe-tests/.baseline-docs/
and AGENTS.baseline.md for component guidance.

## Task

Build a shipping method selector with three options: Standard (free, 5-7 days),
Express ($9.99, 2-3 days), Overnight ($19.99, next day)

## Output
...same format...
```

**HTML agent sees:**

```
You are generating React/TSX code using ONLY plain HTML elements and inline CSS.
Do NOT use any component library. Use standard HTML elements (div, button, input, etc.)
with inline styles or a styles object.

## Task

Build a shipping method selector with three options: Standard (free, 5-7 days),
Express ($9.99, 2-3 days), Overnight ($19.99, next day)

## Output
...same format...
```

Note: no system-specific rules, no expected components, no pre-built commands. The agent discovers what it needs through the system's own docs.

## Checker Protocol

**Before running or modifying any vibe test, verify these 5 invariants.**

### 1. Fair Evaluators

- Same evaluation logic across all configurations (tsc, scoring dimensions)
- Same pass/fail criteria — don't score one config differently than another
- Target-aware scoring is OK (different systems need different counting methods) but the judgments must be equivalent
- Evaluation must be blind to which config produced the output

### 2. Only the System Under Test Varies

- Same prompts across all configurations (same IDs, same text)
- Same persona across all configurations
- Same output format requirements
- Equivalent sub-agent instructions — if one config gets "read the README", all get an analogous instruction
- No system-specific coaching rules (e.g. "use StyleX" or "use Tailwind") — let the docs teach that

### 3. Never Leak the Answer

- `expectedComponents` is for evaluation ONLY — never include in the sub-agent prompt
- Don't pre-build retrieval commands from expected components
- Don't hint at which components to use
- Don't include rules that only make sense for one system
- The agent should discover the right approach through the system's own docs

### 4. Representative Environment

- Sub-agents should have a realistic project setup (node_modules, package.json)
- The docs/tools available should match what a real consumer would have
- Don't give sub-agents access to the source repo if a real user would only have the npm package
- Test the actual delivery mechanism (README in node_modules, not hand-written skill docs)

### 5. Context-Free Sub-Agents

- Sub-agents must be spawned fresh with no prior conversation context
- No inherited knowledge about the design system from the parent session
- The sub-agent's only knowledge comes from what it discovers during the task
- Don't reuse sub-agent sessions across prompts — each prompt gets a fresh agent

## How to Verify

Before any test run, review the generated task prompts:

```bash
# Generate an iteration without running it
node internal/vibe-tests/src/setup-iteration.mjs --sample 3 --target xds
node internal/vibe-tests/src/setup-iteration.mjs --sample 3 --target baseline

# Read the task files and compare:
# - Are the prompts identical (same task text)?
# - Does either prompt contain expectedComponents or pre-built commands?
# - Does either prompt contain system-specific coaching rules?
# - Do the doc retrieval instructions point to representative paths?
```

For evaluation fairness, check `universal-eval.ts`:

- Search for `target ===` to find all target-aware branches
- Verify each branch is measuring the equivalent concept for its system
- Watch for any target getting a skip/bonus the others don't

## Known Accepted Asymmetries

These are intentional and documented — they slightly favor baseline, making XDS wins more credible:

- **Efficiency:** Tailwind's single-line `className` gets a lower styling-ratio than XDS's multi-line `stylex.create` blocks, despite encoding more decisions
- **Maintainability:** Tailwind scale values (`p-4`, `text-sm`) count as semantic, which is generous compared to how raw `16px` is counted for HTML

## Directory Structure

```
internal/vibe-tests/
├── test-sets/           # Prompt batteries (JSON)
├── src/                 # Runner scripts and evaluation
│   ├── setup-iteration.mjs   # Single-target iteration setup
│   ├── setup-nightly.mjs     # 3-target nightly setup
│   ├── universal-eval.ts     # Static analysis scoring (5 dimensions)
│   ├── universal-aggregate.ts # Score aggregation
│   ├── universal-compare.ts  # Cross-target comparison
│   ├── build-previews.ts     # TSX → HTML compilation + tsc
│   ├── screenshot-previews.ts # Playwright screenshots
│   ├── build-report.ts       # Vite HTML report
│   └── deploy-report.ts      # gh-pages deployment
├── .baseline/           # Real shadcn/ui components for baseline tsc
├── results/             # Iteration results (gitignored)
└── README.md            # This file
```
