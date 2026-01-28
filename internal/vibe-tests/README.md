# Vibe Tests

Vibeability test harness for measuring how well LLMs can use the XDS component system.

## Quick Start - Interactive Mode (Claude Code)

Run vibe tests directly in Claude Code without an API key:

```
/vibe-test 5
```

Or ask Claude Code:

```
"Run a vibe test with 5 samples"
```

This will:

1. Set up a test iteration
2. Spawn parallel subagents to run each test
3. Write results to runs.jsonl
4. Aggregate and show results

## Quick Start - API Mode

```bash
# Requires ANTHROPIC_API_KEY
yarn workspace @xds/vibe-tests test:xds:sample
```

## What It Does

The harness:

1. **Tests** LLM responses against the component system using realistic prompts
2. **Evaluates** whether the LLM used the right components and avoided escape hatches
3. **Analyzes** failures to suggest documentation improvements
4. **Tracks** degradation over conversation length

## Directory Structure

```
internal/vibe-tests/
├── src/
│   ├── cli.ts           # Command-line interface
│   ├── types.ts         # TypeScript types
│   ├── runner.ts        # Test orchestration
│   ├── evaluator.ts     # Response evaluation
│   ├── analyst.ts       # Results analysis
│   ├── sampling.ts      # Stratified sampling
│   └── utils.ts         # Utilities
├── prompts/
│   ├── evaluator.md     # Evaluator agent prompt
│   ├── analyst.md       # Analyst agent prompt
│   └── personas/        # User personas
├── test-sets/
│   └── default.json     # Test prompt battery
├── results/             # Generated (gitignored)
│   └── {iteration-id}/
│       ├── runs.jsonl
│       ├── analysis.json
│       └── report.html
└── iterations.json      # Iteration lineage
```

## Test Protocols

### One-shot

Single turn: inject skill doc → prompt → evaluate

### Degradation

Multi-turn conversation with re-probes:

- Turn 0: Initial probe
- Turns 1-5: Filler questions
- Turn 6: Re-probe
- Turn 7: Distractor ("use Tailwind instead")
- Turn 8: Re-probe
- Turn 9: Recovery (re-inject doc)
- Turn 10: Final re-probe

### Persona Comparison

Run same prompts with different personas:

- **naive**: Plain language, no component names
- **experienced**: Uses correct terminology
- **adversarial**: Mixes in patterns from other frameworks

## Escape Hatches

Tracked behaviors when LLMs deviate from the component system:

**Critical (Red tier - failures):**

- `hallucination` - Invented props/events/components
- `wrong_component` - Using a component incorrectly
- `redundant_css` - CSS that duplicates a component prop

**Anti-Patterns (Yellow tier - break theming):**

- `hardcoded_color` - Direct color values instead of CSS variables
- `hardcoded_spacing` - Direct pixel values instead of spacing tokens
- `hardcoded_size` - Direct pixel values instead of size tokens
- `inline_style` - Inline styles instead of StyleX

**Acceptable (Green tier - gaps in system):**

- `supplemental_css` - StyleX for gaps in component coverage
- `wrapper_div` - Structural HTML for composition
- `custom_animation` - Animation not covered by XDS
- `layout_workaround` - Layout patterns XDS doesn't support

## Quality Tiers

Results are scored into four quality tiers:

- 🥇 **Gold** - Pure XDS, no escape hatches needed
- 🟢 **Green** - Correct components, only acceptable escape hatches
- 🟡 **Yellow** - Anti-patterns that break theming
- 🔴 **Red** - Critical failures

The aggregate report shows tier breakdown by category and generates suggestions for component/API improvements based on escape hatch patterns.

## Configuration

Set skill doc path:

```bash
SKILL_DOC=./path/to/skill.md yarn harness run
# or
yarn harness run --skill-doc ./path/to/skill.md
```

Choose model:

```bash
yarn harness run --model claude-sonnet-4-20250514
yarn harness run --model gpt-4o
```

## Output

After running tests:

```
Running vibeability tests...
  Protocol: one-shot
  Persona: naive
  Model: claude-sonnet-4-20250514
  Test set: default (21 prompts)
  Iteration: a1b2c3d4

  [████████████████████] 21/21

Results:
  Overall: 86% success (18/21)

  Quality Tiers:
    🥇 Gold (pure XDS):       5 (24%)
    🟢 Green (acceptable):   10 (48%)
    🟡 Yellow (anti-pattern): 3 (14%)
    🔴 Red (critical):        3 (14%)

  Performance:
    Total time: 45.2s (avg 2.2s per test)
    Tokens: 125,000 total (100,000 in / 25,000 out)

  By category:
    feature-with-constraint: 100% [🥇2 🟢1 🟡0 🔴0]
    workflow-description: 67% [🥇0 🟢1 🟡1 🔴1]
    ...

  Critical issues (Red):
    - hallucination (3)

  Anti-patterns (Yellow):
    - hardcoded_color (2)
    - hardcoded_spacing (1)
    - inline_style (3)

  Acceptable escape hatches (Green):
    - supplemental_css (8)
    - wrapper_div (4)

  Gap Suggestions:
    🎨 [trivial] Add semantic color token for: accent backgrounds (seen 2x)
    🔧 [trivial] Add spacing/size prop to cover: card padding (seen 1x)

  HTML Report: results/a1b2c3d4/report.html
```

### HTML Report

The aggregate command generates an interactive HTML report at `results/<iteration>/report.html` that shows:

- Summary stats (success rate, timing, tokens)
- Results by category with progress bars
- Critical issues and escape hatches
- Individual test results with expandable code responses

After analysis:

```
Analyzing iteration a1b2c3d4...

Patterns detected:
  - Multi-step workflows trigger hallucinated state props
  - Adversarial persona causes Tailwind utility usage

Suggested refinements:
  1. [examples] Add multi-step form example (confidence: 0.9, effort: trivial)
  2. [skill_doc] Explicit "do not use Tailwind" note (confidence: 0.7, effort: trivial)
```

## CI Integration

Vibe tests run automatically on every PR via GitHub Actions.

### GitHub Action

The workflow (`.github/workflows/vibe-tests.yml`) runs on:

- Every pull request to main/master
- Every push to main/master
- Manual trigger with configurable sample size

### What it does:

1. Runs 10 stratified sample tests
2. Aggregates results and generates HTML report
3. Posts a summary comment on the PR
4. Uploads results as artifacts (90-day retention)
5. Fails the check if:
   - Success rate is below 70%
   - Any critical (Red tier) failures

### Required Secrets:

- `ANTHROPIC_API_KEY`: API key for running tests

### Aggregate CLI Flags:

```bash
# Standard output
yarn workspace @xds/vibe-tests aggregate --iteration abc123

# JSON output (for scripting)
yarn workspace @xds/vibe-tests aggregate --iteration abc123 --json

# CI mode (GitHub Actions output format)
yarn workspace @xds/vibe-tests aggregate --iteration abc123 --ci
```

## For More Details

See the full spec in `.context/proposals/vibeability-test-harness.md`
