# Setup test — zero-damage Astryx adoption in established apps

**Status:** integrated preparation and measurement harness. No executor runs or model findings are committed here.

## Goal and hard stop

The goal is zero unintended host damage. Installing Astryx alone must not change any existing host radius, color, typography or font metric, spacing, shadow, border, geometry, color-mode behavior, or layer order. A requested insertion or replacement may change only that explicitly named surface.

`cosmetic-drift` remains a useful diagnostic label, but it is a failed run. The iteration loop may use failures and per-dimension deltas to refine candidate instructions; it does not authorize shipping. Candidate instructions stop and ship only after a separate final confirmation has **100% valid runs classified `clean` with task-specific success** across every supported fixture × prompt × harness/model bundle × repetition. The final confirmation permits no broken, noisy, silent-damage, or cosmetic outcomes; missing probes; visible variable, contrast, layer, overlay, or geometry regressions; escape hatches; or post-run manual edits.

A classified stochastic infrastructure failure may be rerun only under the preregistered policy in `matrix.json`. The failed attempt remains recorded. A real agent failure is a valid failing run and may not be retried away. The configured Codex bundle is blocked by an upstream empty-turn issue, so final confirmation cannot start or claim all configured bundles until that blocker clears.

Damage in the directed `direct` control is a product gap. It blocks candidate-instruction shipping; it is not an accepted limitation or a documentation result.

## Canonical fixtures

Every run starts from the shared immutable fixtures in `../fixtures/`:

- `tailwind-v4-control` — a plain React, Vite, and Tailwind v4 app with only background/foreground semantics.
- `shadcn-tailwind-v4-established` — an established shadcn-style Tailwind v4 token vocabulary and card/form/table/status surface plus a portal dialog with independently controlled tooltip and menu portals.
- `enterprise-scoped-synthetic` — an original dense app with explicit light/dark control, non-shadcn tokens, a guest design-system subtree, and a guest-scoped portal dialog whose nested menu crosses the host boundary.

`run-setup.mjs` validates each fixture recipe and hash manifest, copies the fixture into a run sandbox, and never writes to committed fixture source. Tailwind v3 remains explicitly deferred until the v4 controls and measures separate.

## Tasks

The basic setup tasks remain: install-only proof (`s0`), button insertion (`s1`), status replacement (`s2`), and selector replacement (`s3`). `s0` deliberately measures the new proof component separately from every pre-existing host probe.

The two composition tasks run on different established fixtures:

- `s4`: an Astryx tooltip and selector popup inside the existing Tailwind/shadcn dialog;
- `s5`: the existing Tailwind menu inside a new Astryx dialog in the scoped enterprise fixture.

Each task declares stable task-owned `data-vibe-result` markers. They are measurement hooks, not implementation hints. The evaluator uses them to verify exact presence, task completion, keyboard reachability, visibility, clipping, center hit-testing, stack order, and—where host surfaces move into an Astryx dialog—baseline host-token styling. Fixture-owned `data-vibe-probe` markers remain the host baseline and may not be repurposed. Container text protection compares full normalized text from unmarked host descendants while excluding nested probe, result, and replacement subtrees. Each intentional replacement names exactly one fixture probe, requires the original probe to be absent afterward, and names a result that preserves its host text. Other allowances are fixture- and field-specific: host allowances may permit only text or exact position coordinates, while overlay allowances may permit only exact bounds. They never exempt host or overlay computed styles, or an entire neighboring probe.

## Controls

`conditions.json` defines four ordered controls. Astryx is preinstalled in none of them.

| Condition   | Purpose                                                                             |
| ----------- | ----------------------------------------------------------------------------------- |
| `floor`     | Task only; no added setup pointer.                                                  |
| `current`   | A pointer to the current public CLI documentation.                                  |
| `candidate` | Current pointer plus proposed existing-app guidance.                                |
| `direct`    | Exact installation edits; any residue identifies a product gap and blocks shipping. |

Guidance is committed into the sandbox baseline before execution, so the resulting diff contains only executor work.

## Measurement and integrity

All conditions use the same evaluator against a pristine copy of the same fixture in light and dark modes:

1. Typecheck and production build.
2. Console, page, and failed-request errors.
3. Exact computed-style comparisons for color/background; per-side border color, width, and style; all four radii; shadow; font family, size, weight, line height, and letter spacing; per-side padding and margin; gaps; dimensions; position; and transform.
4. Exact `getBoundingClientRect()` snapshots after Chromium values are serialized to 1/64 CSS px, the browser's subpixel grid. This is normalization, not a pass tolerance: normalized values must match exactly.
5. WCAG AA contrast regressions, color-mode behavior, emitted cascade order, and visible consequences of changed host variables. Variable changes alone remain diagnostic only when every marked host computed style and geometry snapshot is unchanged.
6. Existing host overlays and both cross-system composition directions: presence, keyboard reachability, visibility, viewport intersection, clipping ancestors, center hit target, top-layer state, and stack order above dialog and backdrop.
7. Task-specific output markers and semantics, kept separate from host baseline probes.
8. The executor's source diff. The evaluator rejects deleted or wholesale-replaced host files, blanket resets, hardcoded `!important`, disabled dark-mode behavior, missing Astryx use, missing requested composition, and changed/deleted host probes or overlays. Replacement is judged on content, not on raw diff lines: lines are compared with their indentation and interior whitespace normalized, so wrapping a component tree in a provider — which re-indents every line under it — deletes nothing, while minifying or rewriting a file still deletes all of it.
9. A runner-recorded agent diff digest. The evaluator only measures; it never patches. A missing or mismatched digest is post-run manual intervention and fails acceptance.
10. Public artifact safety. Measurements use stable fixture identifiers instead of local app paths, redact private paths and hosts from diagnostics, normalize provenance usage sources to a generic label, and fail closed before setup or universal aggregate reports can emit private path data.

Verdicts remain `broken-build`, `noisy`, `silent-damage`, `cosmetic-drift`, and `clean`. `passesAcceptance` is true only when the verdict is `clean`, the task contract succeeds, no escape hatch is present, and the measured diff exactly matches the runner's agent-output digest.

## Exploratory iteration rule

The guidance report compares current and candidate runs cell-for-cell and prints candidate-minus-current deltas for every hard dimension: build, runtime, task completion, color, font, radius, border, shadow, geometry, contrast, and layering. It never collapses those results into a weighted score or an automatic advance/reject decision.

The operator reviews the explicit tradeoffs while refining instructions. A large gain with a small regression may be a useful next iteration, while a balanced tradeoff may not be; the harness does not invent a threshold for that judgment. This flexibility applies only to exploratory A/B selection. Final confirmation has no tradeoff allowance: every valid run must pass strict acceptance.

## Matrix and exact counts

Four paired executor bundles remain configured: native/Claude-family, Claude Code/Claude-family, native/GPT-family, and Codex/GPT-family. Exact model versions come from execution provenance.

Prompt applicability produces 14 fixture-prompt pairs: four basic tasks across three fixtures (12), plus one cross-system task on each established fixture (2).

1. **Separation — 48 prepared runs:** `3 fixtures × 2 controls × s1 × 4 bundles × K=2`.
2. **Guidance iteration — 400 additional prepared runs:** the full four-condition matrix has 448 unique cells; reuse the 48 separation cells and prepare the other 400. No control evidence is rerun or double-counted.
3. **Final confirmation — 112 required valid runs:** `14 supported fixture-prompt pairs × candidate × 4 bundles × K=2`.

The repository prepares tasks and sandboxes but does not launch executors. Missing, blocked, invalid, or omitted cells make the confirmation incomplete; they do not shrink its denominator.

## Commands

```bash
# Validate matrix expansion, evaluators, integrity checks, and provenance.
pnpm vitest run internal/vibe-tests/setup-test --project node

# Prepare one small cell without launching an executor.
node internal/vibe-tests/setup-test/run-setup.mjs \
  --stage separation \
  --fixtures tailwind-v4-control \
  --conditions floor \
  --prompts s1 \
  --bundles native-claude \
  --reps 1 \
  --out /tmp/setup-test

# Immediately after the executor settles, record this command's diffSha256 as
# execution.agentDiffSha256 in the sidecar before measurement.
node internal/vibe-tests/setup-test/setup-integrity.mjs --app <sandbox>

# Measure without modifying source and carry the sidecar forward.
node internal/vibe-tests/setup-test/setup-measure.mjs \
  --app <sandbox> \
  --fixture tailwind-v4-control \
  --provenance <run.provenance.json> \
  --out <measurement.json>
```
