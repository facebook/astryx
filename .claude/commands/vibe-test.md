# Run Vibe Tests

Run vibeability tests to measure how well the XDS skill doc helps LLMs generate correct component code.

## Sample Count

$ARGUMENTS

If no argument provided, default to 5 samples.

## Instructions

Run interactive vibe tests using parallel subagents:

### Step 1: Setup the test iteration

Run the interactive setup command:

```bash
yarn workspace @xds/vibe-tests interactive --sample <count>
```

This creates:

- A unique iteration ID
- Task files in `internal/vibe-tests/results/<iteration>/tasks/`
- A manifest file

### Step 2: Read the test prompts

Read the manifest to get the list of test prompts:

```
internal/vibe-tests/results/<iteration>/manifest.json
```

### Step 3: Run tests in parallel

For each test prompt, spawn a subagent using the Task tool with:

- `subagent_type`: "general-purpose"
- Read the skill doc at `packages/core/xds.md`
- Generate code for the prompt using XDS components
- Self-evaluate the response for:
  - Correct components used
  - No hallucinated props
  - Acceptable vs critical escape hatches
- Track timing: record start time before generating, calculate durationMs after
- Return JSON with: response, evaluation, durationMs, inputTokens, outputTokens

### Step 4: Write results

After all subagents complete, write results to:

```
internal/vibe-tests/results/<iteration>/runs.jsonl
```

Each line should be a JSON object with:

```json
{
  "id": "<iteration>-<promptId>",
  "timestamp": "<ISO timestamp>",
  "systemVersion": "xds-llms-v1",
  "model": "claude-code-interactive",
  "persona": "naive",
  "promptCategory": "<category>",
  "trajectoryDepth": 0,
  "prompt": "<the prompt>",
  "response": "<generated code>",
  "evaluation": {
    "success": true/false,
    "componentsUsed": ["XDSCard", ...],
    "componentsExpected": ["XDSCard", ...],
    "escapeHatches": [{"type": "...", "severity": "acceptable/critical", "detail": "...", "codeSnippet": "..."}],
    "failureMode": null or "description",
    "confusionSignals": []
  },
  "fullConversation": [],
  "contextWindowUsage": 0,
  "durationMs": <milliseconds taken>,
  "inputTokens": <input tokens used>,
  "outputTokens": <output tokens generated>
}
```

### Step 5: Aggregate results

Run:

```bash
yarn workspace @xds/vibe-tests aggregate --iteration <id>
```

This will print a summary showing:

- Overall success rate
- Performance stats (total time, avg time, tokens used)
- Success by category
- Critical issues (if any)
- Acceptable escape hatches

It also generates an HTML report at `results/<iteration>/report.html` that you can open in a browser to inspect individual test results.

### Evaluation Criteria

**Quality Tiers:**

- 🥇 **Gold** - Pure XDS, no escape hatches needed
- 🟢 **Green** - Correct components, only acceptable escape hatches
- 🟡 **Yellow** - Anti-patterns that break theming (hardcoded values)
- 🔴 **Red** - Critical failures

**Critical escape hatches (Red tier):**

- `hallucination` - Invented props/components that don't exist
- `wrong_component` - Using a component incorrectly
- `redundant_css` - CSS that duplicates a component prop

**Anti-pattern escape hatches (Yellow tier - break theming):**

- `hardcoded_color` - Direct color values instead of CSS variables
- `hardcoded_spacing` - Direct pixel values for spacing instead of CSS variables
- `hardcoded_size` - Direct pixel values for sizes instead of CSS variables
- `inline_style` - Inline styles instead of StyleX

**Acceptable escape hatches (Green tier):**

- `supplemental_css` - StyleX for things XDS doesn't cover
- `wrapper_div` - Structural HTML for composition
- `custom_animation` - Animation not covered by XDS
- `layout_workaround` - Layout patterns XDS doesn't support

When evaluating, also include a `gap` field on escape hatches describing what capability is missing, to help generate improvement suggestions.
