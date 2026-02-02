# Vibeability Test Harness Spec

Build a test harness that measures how well LLMs can use a component system, tracks degradation over conversation length, and suggests refinements through a closed-loop analysis cycle.

## Directory Structure

```
internal/vibe-tests/
├── src/
│   ├── interactive.ts      # Sets up test iteration for Claude Code subagents
│   ├── run-interactive.ts  # Generates subagent spawn instructions
│   ├── aggregate.ts        # Aggregates results, generates reports
│   ├── types.ts            # Core type definitions
│   └── utils.ts            # Shared utilities
├── docs/
│   └── job-taxonomy.md     # Token/time analysis documentation
├── prompts/
│   └── test-set.json       # Prompt battery organized by category
├── results/
│   └── {iteration-id}/
│       ├── manifest.json   # Iteration metadata
│       ├── tasks/          # Individual task files for subagents
│       │   └── {promptId}.json
│       ├── results/        # Individual result files (avoids race conditions)
│       │   └── {promptId}.json
│       ├── aggregate.json  # Aggregated metrics
│       └── report.html     # Visual report with charts
└── .xds-docs/              # XDS documentation (auto-injected via AGENTS.md)
    ├── AGENTS.md
    ├── principles.md
    ├── tokens.md
    └── {Component}.md
```

## Core Types

```typescript
interface Turn {
  type: 'probe' | 'filler' | 'distractor' | 'recovery';
  prompt: string;
  response: string;
  evaluation?: Evaluation;
}

type EscapeHatchType =
  | 'hallucination'
  | 'wrong_component'
  | 'redundant_css'
  | 'supplemental_css'
  | 'wrapper_div'
  | 'inline_style' // Anti-pattern: should use StyleX instead
  | 'hardcoded_color' // Anti-pattern: breaks theming
  | 'hardcoded_spacing' // Anti-pattern: breaks spacing system
  | 'hardcoded_size' // Acceptable: explicit sizes are often needed
  | 'custom_animation' // Gap: missing animation support
  | 'layout_workaround'; // Gap: missing layout primitive

type EscapeHatchSeverity = 'critical' | 'acceptable';

interface EscapeHatch {
  type: EscapeHatchType;
  severity: EscapeHatchSeverity;
  detail: string;
  codeSnippet: string;
  gap?: string; // What capability gap does this represent?
}

/**
 * Result quality tiers:
 * - gold: Pure XDS, no escape hatches needed
 * - green: Correct components, only acceptable escape hatches
 * - yellow: Minor issues (anti-patterns like hardcoded values)
 * - red: Critical failures (hallucinations, wrong components)
 */
type ResultTier = 'gold' | 'green' | 'yellow' | 'red';

interface Evaluation {
  success: boolean;
  tier?: ResultTier;
  componentsUsed: string[];
  componentsExpected: string[];
  escapeHatches: (string | EscapeHatch)[];
  escapeHatchCount?: number;
  failureMode: string | null;
  confusionSignals: string[];
}

/** Job breakdown for output token analysis */
interface JobBreakdown {
  componentRouting: number; // Import statements for XDS components
  componentConfig: number; // Props and configuration on XDS components
  supplementalStyling: number; // StyleX blocks
  contentAuthoring: number; // HTML structure, JSX
  businessLogic: number; // State, handlers, logic
  boilerplate: number; // Type definitions, exports
  total: number;
}

/** Input token breakdown by doc type */
interface InputTokenBreakdown {
  agentsMd: number; // AGENTS.md - always read
  designDocs: number; // principles.md, tokens.md
  componentDocs: number; // Component-specific docs (Button.md, etc.)
  promptOverhead: number; // Task instructions
  total: number;
}

interface TestResult {
  id: string;
  timestamp: string;
  systemVersion: string;
  model: string;
  persona: string;
  promptCategory: string;
  trajectoryDepth: number;
  prompt: string;
  response: string;
  evaluation: Evaluation;
  fullConversation: Turn[];
  contextWindowUsage: number;
  // Timing and usage metrics
  durationMs: number;
  inputTokens: number;
  outputTokens: number;
  // Optional detailed breakdowns
  jobBreakdown?: JobBreakdown;
  docsRead?: string[]; // Docs accessed during generation
}

interface Refinement {
  target: 'skill_doc' | 'component_api' | 'component_naming' | 'examples';
  component: string | null;
  suggestion: string;
  evidence: string[];
  confidence: number;
  effortEstimate: 'trivial' | 'moderate' | 'significant';
}
```

## Quality Tiers

Results are categorized into quality tiers for nuanced analysis:

| Tier   | Icon | Meaning                                              | Counts as Success |
| ------ | ---- | ---------------------------------------------------- | ----------------- |
| Gold   | 🥇   | Pure XDS, no escape hatches needed                   | Yes               |
| Green  | 🟢   | Correct components, only acceptable escape hatches   | Yes               |
| Yellow | 🟡   | Anti-patterns (hardcoded values break theming)       | Yes               |
| Red    | 🔴   | Critical failures (hallucinations, wrong components) | No                |

## Token Usage Breakdown

The harness tracks token usage across two dimensions:

### Input Tokens (estimated from doc reading)

| Source              | Description                                 | Est. Tokens    |
| ------------------- | ------------------------------------------- | -------------- |
| **AGENTS.md**       | Component catalog and XDS guidance          | ~173           |
| **Design docs**     | principles.md, tokens.md - styling patterns | ~1,200         |
| **Component docs**  | Button.md, TextInput.md, etc.               | 300-2,000 each |
| **Prompt overhead** | Task instructions and persona               | ~375           |

### Output Tokens (by job type)

Each generated code response is analyzed by job category:

| Job                      | Description                                 | Typical % |
| ------------------------ | ------------------------------------------- | --------- |
| **Component Routing**    | Import statements for XDS components        | 3-10%     |
| **Component Config**     | Props and attributes on XDS components      | 7-30%     |
| **Supplemental Styling** | StyleX blocks for layout/spacing gaps       | 10-27%    |
| **Content Authoring**    | HTML structure, JSX elements, copy          | 15-27%    |
| **Business Logic**       | useState, handlers, API calls, conditionals | 5-51%     |
| **Boilerplate**          | Type definitions, imports, exports          | 5-10%     |

Business logic dominates integration-oriented prompts (51%), while page-setup prompts are more balanced across styling, content, and config.

## Timing

Timing is tracked per test and aggregated per category:

- **Per test**: `durationMs` field in TestResult
- **Inferred**: When not reported, timing is calculated from file timestamps (task creation → result write)
- **Per category**: Average duration shown in aggregate reports

## Escape Hatch Severity

**Critical** (red tier - counts against success):

- `hallucination` — Inventing props, components, or APIs that don't exist
- `wrong_component` — Using a component incorrectly
- `redundant_css` — CSS that duplicates component props

**Anti-pattern** (yellow tier - noted, still success):

- `inline_style` — Should use StyleX
- `hardcoded_color` — Breaks theming
- `hardcoded_spacing` — Breaks spacing system

**Acceptable** (green tier - expected gaps):

- `supplemental_css` — CSS for layout gaps
- `wrapper_div` — Structural HTML for composition
- `hardcoded_size` — Explicit sizes often needed
- `custom_animation` — Missing animation support
- `layout_workaround` — Missing layout primitive

## Prompt Categories

1. **feature-with-constraint**: "A banner warning trial expires in X days with upgrade button"
2. **workflow-description**: "Checkout flow: cart → shipping → payment → confirmation"
3. **clone-with-modification**: "Stripe's pricing table with monthly/annual toggle"
4. **state-driven**: "Dashboard with loading → error → data states"
5. **data-display**: "User table with sortable columns and search"
6. **responsive-context**: "Navigation that collapses to hamburger on mobile"
7. **integration-oriented**: "Form that validates email and posts to /api/subscribe"
8. **page-setup**: "Landing page with hero, features, and CTA"

## Test Protocols

### One-shot (default)

1. Read XDS docs (AGENTS.md auto-injected, component docs as needed)
2. Generate code for prompt
3. Self-evaluate response
4. Write result to individual file

### Degradation curve (`--degradation`)

1. Probe at turn 0, evaluate
2. Run 5 filler turns (unrelated questions)
3. Re-probe at turn 6, evaluate
4. Inject distractor ("now do it in Tailwind")
5. Re-probe at turn 8, evaluate
6. Inject recovery (re-read docs)
7. Re-probe at turn 10, evaluate
8. Generate line graph showing tier progression

## CLI Interface

```bash
# Set up interactive test iteration
yarn workspace @xds/vibe-tests interactive --sample 5

# Set up degradation test
yarn workspace @xds/vibe-tests interactive --sample 3 --degradation

# Aggregate results after subagents complete
yarn workspace @xds/vibe-tests aggregate --iteration abc123

# Output JSON instead of console
yarn workspace @xds/vibe-tests aggregate --iteration abc123 --json

# CI mode (non-zero exit on low success rate)
yarn workspace @xds/vibe-tests aggregate --iteration abc123 --ci
```

## Running Tests with Subagents

Tests are run via Claude Code subagents spawned in parallel:

1. Run `yarn workspace @xds/vibe-tests interactive --sample N`
2. Spawn subagents with `mode: "bypassPermissions"` for each task
3. Each subagent:
   - Reads task file from `results/{iteration}/tasks/{promptId}.json`
   - Reads XDS docs (AGENTS.md auto-injected)
   - Generates code for the prompt
   - Self-evaluates the response
   - Tracks timing (start → end)
   - Records docs read
   - Writes result to `results/{iteration}/results/{promptId}.json`
4. Run `yarn workspace @xds/vibe-tests aggregate --iteration {id}`

## Output Example

### Console Output

```
📊 Vibe Test Results - Iteration 657c993f
==================================================

Overall: 100% success (2/2)

🏆 Quality Tiers:
  🥇 Gold (pure XDS):     2 (100%)
  🟢 Green (acceptable):  0 (0%)
  🟡 Yellow (anti-pattern): 0 (0%)
  🔴 Red (critical):      0 (0%)

⏱️  Performance:
  Total time: 33.3s (avg 16.7s per test)

By Category:
  data-display              100% (1/1) [🥇1 🟢0 🟡0 🔴0] ⏱️23.3s
  integration-oriented      100% (1/1) [🥇1 🟢0 🟡0 🔴0] ⏱️10.0s

📊 Token Usage Breakdown:
  ┌─────────────────────────────────────────────────┐
  │ INPUT TOKENS (estimated from doc reading)       │
  ├─────────────────────────────────────────────────┤
  │   AGENTS.md:           346 tokens               │
  │   Design docs:        2360 tokens               │
  │   Component docs:     7033 tokens               │
  │   Prompt overhead:     750 tokens               │
  │   ─────────────────────────────                 │
  │   Input subtotal:    10489 tokens               │
  ├─────────────────────────────────────────────────┤
  │ OUTPUT TOKENS (from job breakdown)              │
  ├─────────────────────────────────────────────────┤
  │   Component routing:       3%  (~73 tokens)     │
  │   Component config:       13%  (~281 tokens)    │
  │   Supplemental styling:   14%  (~301 tokens)    │
  │   Content authoring:      45%  (~943 tokens)    │
  │   Business logic:         19%  (~411 tokens)    │
  │   Boilerplate:             5%  (~103 tokens)    │
  │   ─────────────────────────────                 │
  │   Output subtotal:       2112 tokens            │
  ├─────────────────────────────────────────────────┤
  │ TOTAL:                  12601 tokens            │
  └─────────────────────────────────────────────────┘

✓ Acceptable Escape Hatches:
  - supplemental_css: 2

💡 Gap Suggestions (component/API improvements):
  🔧 [trivial] Add prop or variant to cover: supplemental_css (seen 2x)
```

### HTML Report

The HTML report includes:

- Quality tier breakdown with visual bars
- Results by category with timing
- Token usage breakdown (input and output) - aggregate and per test
- Degradation line graph (if degradation mode)
- Critical issues, anti-patterns, acceptable hatches
- Gap suggestions for component improvements
- Individual test results with:
  - Tier icon and category
  - Prompt text
  - Escape hatches (if any)
  - Duration (e.g., 23.3s)
  - Token breakdown: Total (input/output) with hover tooltip showing full breakdown
  - Docs read badges (which .md files were accessed)
  - Expandable code view

### Per-Run Token Breakdown

Each individual test shows:

- **Total tokens**: Sum of input + output
- **Input/Output split**: e.g., `6245 (5189/1056)` means 5189 input, 1056 output
- **Hover tooltip**: Full breakdown including:
  - Input: AGENTS tokens, Design doc tokens, Component doc tokens
  - Output: Routing, Config, Styling, Content, Logic, Boilerplate tokens
- **Docs read**: Badges showing which docs were accessed (e.g., `AGENTS`, `principles`, `tokens`, `TextInput`)

## Key Implementation Notes

- **Individual result files**: Each subagent writes to `results/{promptId}.json` to avoid parallel write conflicts
- **Timing inference**: When `durationMs` is 0, timing is inferred from file timestamps
- **Doc tracking**: Subagents record which docs they read in `docsRead` array
- **Token estimation**: Input tokens estimated from doc sizes (~4 chars per token)
- **Job analysis**: Output tokens categorized by parsing code structure
- **Quality tiers**: Gold/green/yellow/red for nuanced success tracking
- **AGENTS.md**: Always used (auto-injected by Claude Code)
