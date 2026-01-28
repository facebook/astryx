# Vibeability Test Harness Spec

Build a test harness that measures how well LLMs can use a component system, tracks degradation over conversation length, and suggests refinements through a closed-loop analysis cycle.

## Directory Structure

```
tools/vibeability-harness/
├── harness.ts              # Main entry point (Deno)
├── prompts/
│   ├── evaluator.md        # Judges generated code against criteria
│   ├── analyst.md          # Analyzes results, suggests refinements
│   └── personas/
│       ├── naive.md        # "I want a card with an image"
│       ├── experienced.md  # Uses correct terminology
│       └── adversarial.md  # References competing patterns
├── test-sets/
│   └── default.json        # Prompt battery organized by category
├── results/
│   └── {iteration-id}/
│       ├── runs.jsonl      # Append-only test results
│       ├── report.html     # Visual report with live previews
│       ├── analysis.json   # Analyst output
│       └── refinements.json
└── iterations.json         # Tracks lineage across refinement cycles
```

## Core Types

```typescript
interface Turn {
  type: 'probe' | 'filler' | 'distractor' | 'recovery';
  prompt: string;
  response: string;
  evaluation?: Evaluation;
}

interface EscapeHatch {
  type:
    | 'hallucination'
    | 'wrong_component'
    | 'redundant_css'
    | 'supplemental_css'
    | 'wrapper_div'
    | 'inline_style';
  severity: 'critical' | 'acceptable';
  detail: string;
  codeSnippet: string;
}

interface Evaluation {
  success: boolean;
  componentsUsed: string[];
  componentsExpected: string[];
  escapeHatches: EscapeHatch[];
  failureMode: string | null;
  confusionSignals: string[]; // hedging language, clarifying questions
}

interface TestResult {
  id: string;
  timestamp: string;
  systemVersion: string; // hash or version of skill doc
  model: string;
  persona: string;
  promptCategory: string;
  trajectoryDepth: number;
  prompt: string;
  response: string;
  evaluation: Evaluation;
  fullConversation: Turn[];
  contextWindowUsage: number;
}

interface Refinement {
  target: 'skill_doc' | 'component_api' | 'component_naming' | 'examples';
  component: string | null;
  suggestion: string;
  evidence: string[]; // TestResult IDs
  confidence: number;
  effortEstimate: 'trivial' | 'moderate' | 'significant';
}

interface Iteration {
  id: string;
  parentIteration: string | null;
  skillDocHash: string;
  refinementsApplied: Refinement[];
  aggregateMetrics: {
    overallSuccessRate: number;
    byCategory: Record<string, number>;
    byPersona: Record<string, number>;
    degradationCliff: number; // avg turn where accuracy drops below 80%
  };
  analystSummary: string;
  nextRefinements: Refinement[];
  promptsRun: string[]; // IDs of prompts actually run (may be sampled subset)
  promptsTotal: number; // total prompts in pool
}

interface TestPrompt {
  id: string;
  category: string;
  prompt: string;
  expectedComponents: string[];
  complexity: 'simple' | 'moderate' | 'complex';
}

interface TestSet {
  name: string;
  prompts: TestPrompt[];
  holdout?: TestPrompt[]; // separate prompts for unbiased evaluation
  fillerPrompts?: string[];
  distractorPrompts?: string[];
  recoveryContext?: string;
}
```

## Escape Hatch Severity

Escape hatches have two severity levels that determine whether they count against success:

**Critical** (counts against success):

- `hallucination` — Inventing props, components, events, or APIs that don't exist
- `wrong_component` — Using a component for something it wasn't designed for
- `redundant_css` — CSS that duplicates what a component prop already handles

**Acceptable** (noted but does NOT count against success):

- `supplemental_css` — CSS for things the component system doesn't cover (layout gaps, responsive breakpoints, animations, decoration)
- `wrapper_div` — Structural HTML needed to compose components
- `inline_style` — Minor inline styles for things without a component prop

The component system doesn't aim for 100% coverage. CSS for layout, responsive behavior, or decoration outside component scope is expected and acceptable.

## Prompt Categories for Test Set

Generate realistic user prompts (goal-oriented, not component-oriented) in these categories:

1. **feature-with-constraint**: "I need a banner that warns users their trial expires in X days and lets them upgrade"
2. **workflow-description**: "Build a checkout flow: cart summary → shipping → payment → confirmation"
3. **clone-with-modification**: "Something like Stripe's pricing table but with monthly/annual toggle"
4. **state-driven**: "Show a dashboard with loading → error → data states"
5. **data-display**: "A table of users with sortable columns and search"
6. **responsive-context**: "Navigation that collapses to hamburger on mobile"
7. **integration-oriented**: "A form that validates email and posts to /api/subscribe"

Each category should have 3-5 prompts at varying complexity. The test set also includes a `holdout` array with different prompts per category for unbiased evaluation.

## Prompt Sampling

To prevent refinement suggestions from overfitting to specific test prompts:

- **`--sample N`**: Stratified sampling — selects N prompts with at least 1 per category, distributes remaining slots round-robin. Each run sees a different subset.
- **`--holdout`**: Runs the holdout prompt set instead of the main set. Use to validate that doc improvements generalize beyond training prompts.
- **No flag**: Runs all prompts (original behavior).

Iteration metadata records `promptsRun` (IDs of prompts used) and `promptsTotal` (pool size) so the analyst knows whether results are from a sample.

## Test Protocols

### One-shot baseline

1. Inject skill doc as system context
2. Run each prompt from test set (or sampled subset)
3. Evaluate response
4. Record result

### Degradation curve

1. Inject skill doc
2. Probe with test prompt, evaluate (turn 0)
3. Run 5 filler turns (unrelated coding questions)
4. Re-probe with natural framing, evaluate (turn 6)
5. Inject distractor ("now do it in Tailwind")
6. Re-probe with natural framing, evaluate (turn 8)
7. Inject recovery (re-inject partial skill doc)
8. Re-probe with natural framing, evaluate (turn 10)
9. Plot accuracy over turns

Re-probes use conversational framing (e.g., "Actually, let me revisit this. {prompt}" or "I want to redo that earlier request. {prompt}") instead of repeating the prompt verbatim. This prevents the LLM from noticing duplicate requests and hedging. Evaluation still uses the original prompt expectations.

### Persona comparison

Run same prompt set with each persona, compare success rates and failure modes.

## Agent Prompts

### Evaluator (prompts/evaluator.md)

You evaluate LLM-generated UI code against a component system.

Given:

- The user's prompt
- The generated response
- The expected components for this task

Return JSON matching the Evaluation schema. Key rules:

- **Success = correct components used where they exist + no critical escape hatches**
- Custom CSS for things the component system doesn't cover is acceptable
- Hallucinated props/events are always critical
- `redundant_css` is critical only when a component prop exists for the same thing
- A response can be successful AND have acceptable escape hatches

### Analyst (prompts/analyst.md)

You analyze batches of vibeability test results to identify patterns and suggest refinements.

Look for:

- Which prompt categories fail most often
- Which components get hallucinated or misused
- Where degradation typically starts in long conversations
- Whether certain personas expose different weaknesses
- **Critical** escape hatch patterns only (ignore acceptable ones)

Root cause categories:

- **Documentation gap**: Component exists but isn't well explained
- **Naming confusion**: Component name suggests wrong usage
- **Missing example**: Use case isn't demonstrated
- **API complexity**: Too many props or unclear defaults
- **Competing patterns**: Other frameworks' patterns interfere
- **Component gap**: No component exists for this need (flag for component team, not a doc fix)

Sampling awareness:

- Require evidence from ≥2 different categories before suggesting a refinement (unless confidence > 0.85 for a component-specific issue)
- Distinguish systemic doc gaps from prompt-specific quirks
- Don't over-index on frequency in sampled results

Prioritize refinements by: high impact + low effort first.

### Personas

**naive.md**: You describe UIs in plain language without technical terms. You don't know component names. You say things like "a box with a shadow" not "a Card component".

**experienced.md**: You know the component system well. You use correct component names and props. You might reference the docs.

**adversarial.md**: You mix in patterns from other systems (Tailwind, shadcn, Bootstrap). You say things like "use flex justify-between" or "like a shadcn Dialog".

## CLI Interface

```bash
# Run full test battery
deno run --allow-all harness.ts run

# Run sampled subset (stratified across categories)
deno run --allow-all harness.ts run --sample 10

# Run holdout set for unbiased evaluation
deno run --allow-all harness.ts run --holdout

# Run specific protocol
deno run --allow-all harness.ts run --protocol degradation

# Run with specific persona
deno run --allow-all harness.ts run --persona naive

# Generate HTML report for visual inspection
deno run --allow-all harness.ts report --iteration abc123

# Analyze results from an iteration
deno run --allow-all harness.ts analyze --iteration abc123

# Start new iteration with refinements applied
deno run --allow-all harness.ts iterate --from abc123

# View iteration history
deno run --allow-all harness.ts history
```

## Configuration

Read skill doc path from env or flag:

```bash
SKILL_DOC=./skills/brownie.md deno run --allow-all harness.ts run
```

Model selection:

```bash
deno run --allow-all harness.ts run --model claude-sonnet-4-20250514
deno run --allow-all harness.ts run --model gpt-4o
```

## Key Implementation Notes

- Use JSONL for results (append-only, resumable)
- Generate iteration IDs as short hashes (first 8 chars of UUID)
- Hash skill doc content to track versions
- Run tests sequentially (rate limit protection with 500ms delay)
- Store full conversation history for debugging
- Analyst should receive batch of results, not one at a time
- Analyst receives sampling metadata (prompts run vs total pool) to avoid overfit suggestions
- Keep token counts rough (string length / 4 is fine)
- Summary output separates critical issues from acceptable escape hatches

## Output Example

After `harness.ts run --sample 10`:

```
Running vibeability tests...
  Protocol: one-shot
  Persona: naive
  Model: claude-sonnet-4-20250514
  Test set: default (10 sampled from 22 prompts)
  Iteration: a1b2c3d4

  [████████████████████] 10/10

Results:
  Overall: 70% success (7/10)

  By category:
    feature-with-constraint: 100%
    workflow-description: 0%
    clone-with-modification: 100%
    state-driven: 100%
    data-display: 100%
    responsive-context: 0%
    integration-oriented: 50%

  Critical issues:
    - hallucination (2)
    - redundant_css (1)

  Acceptable escape hatches:
    - supplemental_css (5)
    - wrapper_div (2)

  Results saved: ./results/a1b2c3d4/runs.jsonl

Run `harness.ts analyze --iteration a1b2c3d4` for refinement suggestions.
```

After `harness.ts analyze`:

```
Analyzing iteration a1b2c3d4...

Patterns detected:
  - "clone-with-modification" prompts trigger Tailwind patterns
  - brow-select events hallucinated (brow-open, input) across 3 categories
  - countdown/timer props frequently hallucinated on Alert

Suggested refinements:
  1. [component_api] Document brow-select events explicitly (confidence: 0.9, effort: trivial)
  2. [examples] Add countdown example to Alert docs (confidence: 0.9, effort: trivial)
  3. [skill_doc] Add explicit "do not use Tailwind" guidance (confidence: 0.7, effort: trivial)

Saved: ./results/a1b2c3d4/refinements.json
```
