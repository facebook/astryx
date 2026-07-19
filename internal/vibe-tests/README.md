# Astryx Vibe Tests

Structured evaluations that compare how well LLMs generate UI code under different design system configurations. Same prompts, different systems, measurable outcomes.

## Prompt Battery

Prompts live in [`test-sets/default.json`](test-sets/default.json). Each prompt has:

```json
{
  "id": "fwc-6",
  "category": "feature-with-constraint",
  "prompt": "Build a shipping method selector with three options: Standard (free, 5-7 days), Express ($9.99, 2-3 days), Overnight ($19.99, next day)",
  "expectedComponents": ["RadioList", "Card"],
  "complexity": "simple"
}
```

- **`prompt`**: the task given to the agent (identical across all configs)
- **`expectedComponents`**: used for evaluation ONLY, never shown to agents
- **`category`**: groups prompts by type (feature-with-constraint, workflow-description, clone-with-modification, state-display, data-display, responsive-challenge, io-integration, page-setup, typography, theme-customization)
- **`complexity`**: simple, moderate, complex

## Sub-Agent Prompts

Each target gets an equivalent prompt. The only thing that varies is the design system name and the project environment.

**All library targets see the same structure:**

```
You are generating React/TSX code using <system name>.
Your project is at <project dir>. Explore it to find available components.

## Task

<prompt text>

## Output
...same format...
```

**HTML target sees:**

```
You are generating React/TSX code using ONLY plain HTML elements and inline CSS.
Your project is at <project dir>. Do NOT use any component library.
Use standard HTML elements (div, button, input, etc.) with inline styles or a styles object.

## Task

<prompt text>

## Output
...same format...
```

Note: no system-specific rules, no expected components, no pre-built commands. The agent discovers what it needs through the project's own files (README, package.json, symlinked sources).

## Checker Protocol

**Before running or modifying any vibe test, verify these 5 invariants.**

### 1. Fair Evaluators

- Same evaluation logic across all configurations (tsc, scoring dimensions)
- Same pass/fail criteria; don't score one config differently than another
- Target-aware scoring is OK (different systems need different counting methods) but the judgments must be equivalent
- Evaluation must be blind to which config produced the output

### 2. Only the System Under Test Varies

- Same prompts across all configurations (same IDs, same text)
- Same persona across all configurations
- Same output format requirements
- Equivalent sub-agent instructions: if one config gets "read the README", all get an analogous instruction
- No system-specific coaching rules (e.g. "use StyleX" or "use Tailwind"); let the docs teach that

### 3. Never Leak the Answer

- `expectedComponents` is for evaluation ONLY; never include in the sub-agent prompt
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
- Don't reuse sub-agent sessions across prompts; each prompt gets a fresh agent

## How to Verify

Before any test run, review the generated task prompts:

```bash
# Generate an iteration without running it
node internal/vibe-tests/src/setup-nightly.mjs --sample 3

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

These are intentional and documented; they slightly favor baseline, making Astryx wins more credible:

- **Efficiency:** Tailwind's single-line `className` gets a lower styling-ratio than Astryx's multi-line `stylex.create` blocks, despite encoding more decisions
- **Maintainability:** Tailwind scale values (`p-4`, `text-sm`) count as semantic, which is generous compared to how raw `16px` is counted for HTML
- **Astryx+Tailwind scoring:** The hybrid target counts styling decisions from both Astryx props and Tailwind classes. This may inflate its decision count relative to pure Astryx, but accurately reflects the code's actual styling surface area

## Form-Framework Vibe Test

A separate test that answers a different question than the component-generation
test above: **which form framework should be the default for Astryx?**

Here the **design system is constant** — every target renders with Astryx
components. The only variable is the form-framework layer wired to those
components. Four targets:

| Target | Framework | Astryx binding |
| --- | --- | --- |
| `formentor` | Formentor (schema-aware) | native `XDSInputSet` |
| `formisch` | Formisch + Valibot | `@astryxdesign/astryx-formisch` |
| `tanstack` | TanStack Form | `@astryxdesign/astryx-tanstack` |
| `rhf` | React Hook Form + Zod | `@astryxdesign/astryx-rhf` |

Each framework gets an **equal-effort Astryx adapter** (Option B parity): the same
five bridge components (text/textarea/number/checkbox/select) binding to the same
core inputs. No framework is pre-integrated more than the others; none is hobbled.

### Running it

```bash
# Calibration: a few prompts across all 4 frameworks
node internal/vibe-tests/src/setup-forms.mjs --sample 3 --core-only

# Full headline baseline (CORE tier only)
node internal/vibe-tests/src/setup-forms.mjs --core-only

# Everything (CORE + STRETCH)
node internal/vibe-tests/src/setup-forms.mjs
```

### Tiers

Prompts in `test-sets/forms.json` are split into two tiers:

- **CORE** — every framework fully supports these. The **headline comparison
  score is computed on CORE only.** Use `--core-only`.
- **STRETCH** — capabilities the Formentor scaffold does not yet support (field
  arrays, nested objects, wizards, typeahead, file upload). These run but are
  **reported separately** as a roadmap signal, never mixed into the headline.

As the scaffold grows, prompts graduate from STRETCH to CORE.

### Evaluation

`form-eval.ts` scores five form-specific dimensions (schema fidelity, validation
correctness, form-grade a11y, state/submission, idiomatic use) on top of the
universal five. The **judgment is identical across frameworks; only the concept
counting is target-aware** (Formentor `fields.x.render` ≡ RHF `<Controller>` ≡
Formisch `<Field>` ≡ TanStack `form.Field`). A calibration test asserts that
equal-quality reference solutions score within a tight band across all four
targets.

## Checker Protocol — Form Test (invariants #6 and #7)

The form test adds two invariants on top of the five above. The top threat is
**self-referential bias**: the same effort authored the Formentor scaffold, its
README, the adapters, and the eval rubric, so the test must actively prevent the
rubric from rewarding "how our scaffold works" instead of genuine form quality.

### 6. Blank-Slate Testers

- Every tester sub-agent is spawned **fresh, with zero prior context**: no
  conversation history, no knowledge of Formentor/Astryx, no memory of other
  prompts or targets.
- Its only inputs are the task prompt and the representative project it can
  explore. It learns the API from the package README, exactly like a real
  consumer installing the package.
- **One fresh agent per (prompt × target).** Never reuse a tester across prompts
  or targets. The parent must not pass any design-system or framework knowledge
  into the spawn.

### 7. Blank-Slate Blind Judge

- The evaluating agent/judge is **also context-free**, and additionally **blind
  to which framework produced the code**:
  - It never sees the target name. Where an LLM judge is used, strip import lines
    and package names before judging, or judge on behavior, not branding.
  - It never sees the author agent's reasoning or the parent conversation.
  - It receives only: the original naive prompt, the produced code, and the fixed
    rubric — the **same rubric object for every sample**.
- The deterministic dimensions in `form-eval.ts` are pure functions and therefore
  inherently context-free and reproducible.
- Any LLM-judge dimension gets a **fresh agent per sample**, the same system
  prompt, no cross-sample memory, temperature pinned low.
- The judge is **never told the hypothesis** ("we hope Formentor wins"). Its
  prompt states only the rubric, never the motivation.

### How to verify (form test)

```bash
# Generate an iteration without running agents
node internal/vibe-tests/src/setup-forms.mjs --sample 3 --core-only

# Then confirm:
# - Task prompts are identical except the framework name + README path
# - No task file contains expectedBehaviors (grep it)
# - The manifest holds expectedBehaviors for eval only
grep -rl expectedBehaviors results/*/tasks/ && echo "LEAK" || echo "clean"
```

For evaluation fairness, check `form-eval.ts`: every `target ===` / `switch
(target)` branch must recognize the **equivalent** concept for its framework, and
the calibration test (`form-eval.test.ts`) must stay green.

## Directory Structure

```
internal/vibe-tests/
├── test-sets/           # Prompt batteries (JSON)
├── src/                 # Runner scripts and evaluation
│   ├── setup-nightly.mjs     # 4-target nightly setup (component generation)
│   ├── setup-forms.mjs       # 4-framework setup (form test)
│   ├── setup-forms-environment.mjs # per-target project + symlink builder
│   ├── universal-eval.ts     # Static analysis scoring (5 dimensions)
│   ├── form-eval.ts          # Form-specific scoring (5 dimensions)
│   ├── universal-aggregate.ts # Score aggregation
│   ├── universal-compare.ts  # Cross-target comparison
│   ├── build-previews.ts     # TSX → HTML compilation + tsc
│   ├── screenshot-previews.ts # Playwright screenshots
│   ├── build-report.ts       # Vite HTML report
│   └── deploy-report.ts      # gh-pages deployment
├── environments/        # Project templates (per target, generic names)
├── .baseline/           # Real shadcn/ui components for baseline tsc
├── results/             # Iteration results (gitignored)
└── README.md            # This file
```
