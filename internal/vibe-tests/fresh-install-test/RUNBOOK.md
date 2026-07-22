# RUNBOOK — "astryx init foolproof" needle-graph measurement

Everything needed to run the full measurement matrix **unattended to completion**.
It's written so you (navi) never have to re-derive the setup — copy the commands.

## Goal
For every historical release (`0.1.0`→`0.1.7`) and each foolproof PR, measure three
rates and record them to the needle scoreboard:
- **core** — `@astryxdesign/core` ended up installed
- **cli** — `@astryxdesign/cli` ended up installed
- **init** — `astryx init` ran (the `<!-- ASTRYX:START -->` marker was written)

One **data point** = one condition × all models. `run-matrix.mjs` runs every model
and records a scoreboard point automatically.

---

## 0. Environment (once per node)

```bash
# The harness dir (relative to repo root). It is currently UNTRACKED in git —
# make sure it exists on this node (commit it to a branch, or copy the folder).
# Required files: run-matrix.mjs run.mjs local-registry.mjs scoreboard.mjs
#                 score.mjs prompts.json models.json  (+ this RUNBOOK.md)
HARNESS="internal/vibe-tests/fresh-install-test"

# Install repo deps via PUBLIC npm — a fresh checkout/worktree has no node_modules,
# and the internal registry 401s. This avoids that:
COREPACK_ENABLE_DOWNLOAD_PROMPT=0 npm_config_registry=https://registry.npmjs.org/ \
  pnpm install --no-frozen-lockfile

# cursor-agent must be installed + authenticated. run.mjs already calls it headless
# with: -p --output-format stream-json --force --trust --sandbox disabled --workspace <tmp>

# KEEP THE MACHINE AWAKE for the whole run (the #1 overnight failure):
caffeinate -dimsu &        # macOS. Linux: `systemd-inhibit --what=idle:sleep sleep 86400 &`
```

---

## 1. Config — identical for EVERY point (do not vary)

| knob | value |
|---|---|
| prompt | scenario A, already in `prompts.json` ("install astryx design…" → "build a to-do app") |
| models | `gpt-5.5-high,claude-opus-4-8-high,gpt-5.2` |
| reps (`--reps`) | **3** for historical points · **6** for PR points |
| `--concurrency` | **2** (per model) |
| `--parallel-models` | on (all 3 models at once ⇒ ≈6 concurrent agents total — the safe ceiling) |
| `--turn-timeout` | `900` |

---

## 2. Data points

**Historical** (real published tarballs, served as the rig's `latest` via `--base-version`):

| label | version | commit |
|---|---|---|
| `v0.1.0` | 0.1.0 | b075032e0b9 |
| `v0.1.1` | 0.1.1 | a514b991515 |
| `v0.1.2` | 0.1.2 | 6c533c70674 |
| `v0.1.3` | 0.1.3 | 6d57c8d9126 |
| `v0.1.4` | 0.1.4 | 7b76c68ae07 |
| `v0.1.5` | 0.1.5 | 75215a41d4d |
| `v0.1.6` | 0.1.6 | 1a0fef5a03b |
| `baseline (0.1.7)` | 0.1.7 | cc83e7a43da (current public `latest` → use `--source public`) |

**PR points** (served via the rig by overlaying the branch's package source):

| label | packages changed | ref to overlay |
|---|---|---|
| `#4147 remove-tty` | cli | `origin/main` (merged, e4867292547) |
| `#4151 scope-invocation` | cli + core | `origin/main` after it merges (else branch `navi/vibe/cli-scoped-invocation`) |
| `#4153 per-cmd-nudge` | cli | `navi/vibe/cli-setup-nudge` |
| `#4154 cli-postinstall` | cli | `navi/vibe/cli-postinstall` |
| `#4155 core-postinstall` | core | `navi/vibe/core-postinstall` |

---

## 3. Commands per point type

### A) Historical version — e.g. 0.1.6
```bash
cd "$HARNESS"
# Serve 0.1.6's REAL tarball as the rig's `latest` for BOTH packages the agent installs:
node local-registry.mjs publish --pkg @astryxdesign/core --base-version 0.1.6
node local-registry.mjs publish --pkg @astryxdesign/cli  --base-version 0.1.6
# Run all models + auto-record a scoreboard point:
node run-matrix.mjs --condition "v0.1.6" --source local --parallel-models \
  --models gpt-5.5-high,claude-opus-4-8-high,gpt-5.2 --reps 3 --concurrency 2 --turn-timeout 900
```
Repeat for 0.1.0 … 0.1.5 (change both `--base-version` and `--condition`).

### B) Baseline 0.1.7 — current public latest (no rig)
```bash
cd "$HARNESS"
node run-matrix.mjs --condition "baseline (0.1.7)" --source public --parallel-models \
  --models gpt-5.5-high,claude-opus-4-8-high,gpt-5.2 --reps 6 --concurrency 2 --turn-timeout 900
```

### C) A PR / commit — overlay the branch's package source onto the rig
```bash
cd "$HARNESS"
REF="navi/vibe/core-postinstall"   # the branch (or origin/main for merged PRs)
git -C <repo-root> fetch origin --quiet

# For a CORE-side PR (e.g. #4155):
OV=$(mktemp -d); git -C <repo-root> archive "$REF:packages/core" | tar -x -C "$OV"
node local-registry.mjs publish --pkg @astryxdesign/core --overlay "$OV"

# For a CLI-side PR (e.g. #4147/#4151/#4153/#4154):
OV=$(mktemp -d); git -C <repo-root> archive "$REF:packages/cli" | tar -x -C "$OV"
node local-registry.mjs publish --pkg @astryxdesign/cli --overlay "$OV"
# (#4151 changes BOTH — overlay core AND cli.)

node run-matrix.mjs --condition "#4155 core-postinstall" --commit <sha> --source local \
  --parallel-models --models gpt-5.5-high,claude-opus-4-8-high,gpt-5.2 --reps 6 --concurrency 2 --turn-timeout 900
```
Notes:
- The overlay replaces the published tarball's files with the branch's, then the rig
  bumps the version so it wins `latest`. `run-matrix --source local` points the agent at the rig.
- Postinstall PRs (#4154/#4155) ship `scripts/postinstall.mjs` + a `postinstall` script;
  `git archive packages/<pkg>` includes both, so the overlay carries them.

---

## 4. Recording (automatic) + inspect
`run-matrix.mjs` records one scoreboard point per model at the end of each run. Then:
```bash
node scoreboard.mjs list                       # human table
node scoreboard.mjs canvas-data > canvas.json  # paste into the tracker canvas
```

---

## 5. Guardrails — failure modes already hit (avoid them)
- **Never** pipe a long run through `| head`, and **never** launch it with `&` in a shell
  that returns — both SIGPIPE the job and leave orphaned agents. Use `nohup … > run.log 2>&1 &`
  (a real detached process) or a tracked background job.
- Between runs: `pkill -9 -f cursor-agent` to clear orphans, then confirm `pgrep -f cursor-agent` is empty.
- Keep total concurrent agents ≈6 (`--concurrency 2` × 3 parallel models). More → API rate limits.
- Every sandbox MUST live under the OS temp dir — `run.mjs` asserts this. Do not disable the guard.
- One rig (one port) serves one `latest`. Do points **sequentially** on the default port
  (4873). If you parallelize across nodes, give each its own port and pass the matching
  registry, but sequential-per-node is the safe default.
- Timed-out/errored reps are auto-excluded from the rates. If a point's `n` comes back
  < ~half of target, `pkill` orphans and re-run just that point.

---

## 6. Resumability + Definition of Done
- **Resumable:** before each point, `node scoreboard.mjs list` — if that `--condition`
  label already has all 3 models with `n ≥ target`, SKIP it. Safe to kill + restart anytime.
- **DONE when ALL true:**
  1. `scoreboard.json` has all 13 points (`v0.1.0`…`v0.1.6`, `baseline (0.1.7)`, `#4147`,
     `#4151`, `#4153`, `#4154`, `#4155`) × 3 models, each with core/cli/init + n≥target.
  2. `node scoreboard.mjs canvas-data` runs clean.
  3. `RESULTS.md` written: the full table + a one-paragraph readout + any FAILED points.
  4. Print `ALL POINTS DONE`.
- If a point fails after 2 retries: record it in `RESULTS.md` as `FAILED-<reason>` and
  CONTINUE. Never halt the whole job for one point.

---

## 7. Expected shape (sanity check)
Historical `0.1.0`→`0.1.7` should be a **flat, low** init-ran floor (nothing changed
init-discovery across those releases). The climb starts at `#4147` and should keep
rising through `#4151` and the three nudge PRs. If a historical point spikes, suspect
contamination (a non-isolated sandbox) and re-run it.
