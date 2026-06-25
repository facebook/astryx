# Run Vibe Tests

Run vibeability tests to measure how well the XDS skill doc helps LLMs generate correct component code.

## Sample Count

$ARGUMENTS

If no argument provided, default to 5 samples.

## Instructions

Run interactive vibe tests using parallel subagents. No API keys required — code generation is done by spawned sub-agents, screenshots by GitHub Actions.

### Step 0: Generate skill doc

Generate the skill doc from the CLI (auto-discovers components from source):

```bash
cd internal/vibe-tests && bash scripts/generate-skill-doc.sh
```

This creates `.generated/xds-skill.md` reflecting all components on the current branch.

### Step 1: Setup the test iteration

Three targets are compared: *XDS*, *baseline* (shadcn/Tailwind), and *raw HTML/CSS*. All three use the **same prompts** — this is the most important fairness constraint.

```bash
cd internal/vibe-tests

# 1. Sample prompts for XDS (records the prompt IDs)
pnpm interactive --target xds --persona naive --sample <count>
# Note the iteration ID and prompt IDs from the output

# 2. Reuse same prompts for baseline
pnpm interactive --target baseline --persona naive --prompts <comma-separated-ids>

# 3. Reuse same prompts for HTML
pnpm interactive --target html --persona naive --prompts <comma-separated-ids>
```

This creates:
- Three iteration IDs (one per target)
- Task files in `results/<iteration>/tasks/<promptId>.json`
- A manifest file per iteration

### Step 2: Spawn sub-agents

Spawn sub-agents using `spawn_agent` — one per prompt per target (e.g. 10 prompts × 3 targets = 30 agents).

Each sub-agent must:

1. **Read the task file** at `results/<iteration>/tasks/<promptId>.json` (on the `xds` node)
2. **Read the target-specific agent doc:**
   - XDS → `AGENTS.md` (generated) + run `npx astryx component --brief-all` for component catalog
   - Baseline → `AGENTS.baseline.md` + read `.baseline-docs/`
   - HTML → `AGENTS.html.md` (no design system docs needed)
3. **Generate a React component** as a `.tsx` file responding to the prompt
4. **Self-evaluate** for correctness, accessibility, escape hatches
5. **Write two files** (on the `xds` node):
   - `results/<iteration>/results/<promptId>.tsx` — the generated component (must have a default export)
   - `results/<iteration>/results/<promptId>.json` — metadata:
     ```json
     {
       "docsRead": ["AGENTS.md", "Button.md", "tokens.md"],
       "completedAt": "2026-03-25T06:00:00Z"
     }
     ```

### Step 3: Verify completeness

After all sub-agents complete, verify every task has a `.tsx` and `.json` result:

```bash
cd internal/vibe-tests
for ITER in <xds-id> <baseline-id> <html-id>; do
  EXPECTED=$(ls results/$ITER/tasks/*.json | wc -l)
  ACTUAL=$(ls results/$ITER/results/*.tsx 2>/dev/null | wc -l)
  echo "$ITER: $ACTUAL/$EXPECTED complete"
done
```

Log any gaps. Missing results mean a sub-agent failed — note which prompt/target is affected.

### Step 4: Build previews & screenshots (GitHub Actions)

Commit results to a branch and trigger the screenshot workflow:

```bash
cd /vercel/sandbox/repos/xds
git checkout -b vibe-test-data/<date>
git add -f internal/vibe-tests/results/
git commit -m "vibe-test: results for $(date +%Y-%m-%d)"
git push -u origin vibe-test-data/<date>

# Trigger the screenshot workflow
gh workflow run vibe-screenshots.yml \
  --ref vibe-test-data/<date> \
  -f iterations="<xds-id>,<baseline-id>,<html-id>"
```

The workflow:
1. Builds self-contained HTML previews (inlines all CSS via vite-plugin-singlefile)
2. Captures Playwright screenshots at 4 combos: desktop/mobile × light/dark
3. Uploads artifacts: `preview-html` and `vibe-test-screenshots`

### Step 5: Wait for GHA and download

Poll the run until complete:

```bash
RUN_ID=$(gh run list --workflow=vibe-screenshots.yml --limit 1 --json databaseId --jq '.[0].databaseId')
gh run watch $RUN_ID
```

Download artifacts:

```bash
gh run download $RUN_ID -n vibe-test-screenshots -D internal/vibe-tests/results/
gh run download $RUN_ID -n preview-html -D internal/vibe-tests/results/
```

If GHA fails: `gh run view $RUN_ID --log-failed`

### Step 6: Aggregate and report

```bash
cd internal/vibe-tests
pnpm aggregate --iteration <xds-id>
pnpm report:deploy --iteration <xds-id> --baseline <baseline-id> --html <html-id>
```

Report URL: `https://facebook.github.io/astryx/reports/<xds-id>/`

### Step 7: Post results

Create a GitHub issue:

```bash
gh issue create --repo facebookexperimental/xds \
  --title "Vibe Test Results — $(date +%Y-%m-%d)" \
  --label "vibe-test" \
  --body "<results summary>"
```

Include: overall scores, dimension winners, report link, gaps, and screenshots.

## Fairness Rules

These rules ensure the comparison is meaningful:

1. **Same prompts** — all targets run the exact same prompt IDs (use `--prompts`)
2. **Same persona** — always `naive` (simulates a developer with no prior knowledge)
3. **Fair docs** — each target gets its own equivalent agent doc, not the other target's
4. **No cross-contamination** — XDS agents don't see baseline docs, and vice versa
5. **10 prompts minimum** — stratified sample covers all categories

## Evaluation Criteria

### Quality Tiers

- 🥇 **Gold** — Pure target usage, no escape hatches needed
- 🟢 **Green** — Correct components, only acceptable escape hatches
- 🟡 **Yellow** — Anti-patterns that break theming (hardcoded values)
- 🔴 **Red** — Critical failures (hallucinations, wrong components)

### Escape Hatch Classification

**Critical (Red tier):**
- `hallucination` — invented props/components that don't exist
- `wrong_component` — using a component incorrectly
- `redundant_css` — CSS that duplicates a component prop

**Anti-pattern (Yellow tier):**
- `hardcoded_color` — direct color values instead of CSS variables
- `hardcoded_spacing` — direct pixel values instead of CSS variables
- `inline_style` — inline styles instead of StyleX

**Acceptable (Green tier):**
- `supplemental_css` — StyleX for things the system doesn't cover
- `wrapper_div` — structural HTML for composition
- `custom_animation` — animation not covered by the system

## Evaluation Dimensions

| Dimension | What It Measures |
|-----------|-----------------|
| Correctness | Valid component usage, no hallucinations |
| Accessibility | Labels, semantics, keyboard support |
| Code Quality | Complexity, patterns, TypeScript usage |
| Efficiency | Decisions/element, DRYness, conciseness |
| Maintainability | Semantic tokens vs magic values, dark mode, locality |
