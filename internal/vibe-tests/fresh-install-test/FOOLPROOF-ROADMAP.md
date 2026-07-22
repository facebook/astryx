# Foolproof `astryx init` — roadmap

**Goal:** make it so that when someone installs Astryx (fresh OR into an existing
project) and builds with an AI agent, the `astryx init` cheat sheet
(`<!-- ASTRYX:START -->` in AGENTS.md/CLAUDE.md) **always** lands. Target:
init-ran ≈ 100%, reliably, across package managers and agents.

**Why:** people `npm install @astryxdesign/core` but never run `astryx init`, so
the agent never gets the component index and guesses APIs.

---

## ⭐ THE WORKFLOW — every commit moves the needle (READ THIS FIRST)

This is the plan. It's a **ratchet**: the branch's git history is a *monotonic climb*
where every commit carries a data point proving it beat the commit before it.
**Never commit a change that doesn't move the needle.**

The loop:

1. **Anchor** — the current HEAD has a recorded scoreboard data point (all 4 models).
2. **Change** — make ONE candidate change (README / banner / auto-init / CLI fix). Keep it uncommitted.
3. **Test** — run the matrix against the change: `run-matrix.mjs --source local` (the rig
   publishes the modified package), n=12 × 4 models.
4. **Compare** — did it beat the anchor? (target metric's lower Wilson bound clears the
   anchor's upper bound, or ≥ +15 pts, **and** core/CLI don't regress).
5. **Decide:**
   - ✅ **Better → COMMIT it, then STORE the data point** (`scoreboard.mjs record` with the
     commit sha + a one-line description). This commit becomes the new anchor.
   - ❌ **Not better → REVERT** (discard/stash the change), keep the prior commit, and **try a
     different idea.** Do not commit failed attempts.
6. **Repeat** from step 2 until core / CLI / init all hit the ceiling for every model.
7. **Certify** the final winning state at **n=100 per model** ("0 failures in 100" ⇒ ≥97%).

Invariants: one change per commit · every commit has a passing data point · no commit
regresses the needle · the scoreboard + canvas tell the story commit-by-commit.

---

## Diagnosis (evidence, from `fresh-install-test`)

Two-turn Sonnet runs (`install astryx design and make a new NextJS app…` →
`build a to-do app`) in empty `/tmp` sandboxes, real public-npm install:

- **CLI discovery is reliable.** Agents find `@astryxdesign/cli` via `npm view` /
  `npm search` AND the core README (which says `npm install -D @astryxdesign/cli`
  — agents copy it verbatim, `-D` and all). They read the README by
  `npm pack`-ing + extracting the tarball.
- **`init` is a coin-flip.** Same prompt+model: one run ran `astryx init --all`
  (marker landed), another installed the CLI but **hand-wired setup from the
  README's manual Quick Start** and never ran init.
- **Root cause:** the core README simultaneously (a) says "run `npx astryx init`
  first" and (b) ships a complete copy-paste manual setup (globals.css +
  providers + layout). The agent can finish the task without init, so init is
  treated as optional. **You can't make a *choice* 100%; you must remove it or
  make init the only easy path.**

---

## Metric & harness (already built)

- `run.mjs` — N reps × 2-turn headless Sonnet in isolated `/tmp` sandboxes,
  full stream-json tool trail captured. Registry routed to public npm.
- `score.mjs` — file-based funnel (Wilson CIs). Headline = **INIT RAN** (marker
  present). Ground truth = disk, not self-report.
- `prompts.json` — the two verbatim turns (single source of truth).

---

## Workstreams

Status keys: ⬜ todo · 🟡 in progress · ✅ done · 🔬 measuring

### W0 — Baseline (ongoing) 🟡
Keep measuring the **currently published** package's init-ran rate.
- `base02` = 10 reps running now. Top up to K≥20 for a tight CI.
- **Acceptance:** a stable baseline init-ran % with Wilson CI.

### W-infra — Local registry (prerequisite for W1/W2/W4) ⬜  → subagent
To A/B test a *modified* package, the agent must `npm install @astryxdesign/core`
and get **our** build. Stand up a local **Verdaccio** that serves modified
`@astryxdesign/*` locally and **uplinks everything else to public npm**.
- Add `run.mjs --source local --registry http://localhost:4873`.
- **Acceptance:** `npm install @astryxdesign/core` from the local registry
  returns our modified README/version; unmodified deps still resolve from public.

### W1 — README experiment (FIRST) ⬜  → subagent drafts, then measure
Restructure core README so **init is the path of least resistance**: lead with
`npx astryx init`, and make the manual setup clearly the fallback (collapsed /
"advanced" / after init), so the agent's easiest route to a working app is init.
- **Acceptance:** init-ran rate ≫ baseline (ideally ≥90%), measured via W-infra.

### W2 — Banner experiment ⬜
A loud, unmissable "run `npx astryx init`" signal the agent can't skip:
- postinstall banner (caveat: pnpm 10 blocks dep scripts; only fires if the agent
  triggers install and reads stdout), and/or
- CLI first-run nudge (only fires once `astryx` is invoked).
- **Acceptance:** measure lift vs baseline; note channel reliability caveats.

### W3 — Prior-art research ⬜  → subagent
How do other libraries guarantee their setup/init runs (esp. with AI agents)?
shadcn `init`, create-next-app/T3, Prisma (`postinstall`, `prisma generate`),
Sentry wizard, Tailwind `init`, Husky `prepare`, Expo, Angular schematics,
Storybook `sb init`, Panda/Chakra, Playwright `install`. Extract patterns that
map to "extremely automatic, never fails."
- **Acceptance:** `research/prior-art.md` with concrete, ranked recommendations.

### W4 — "Extremely automatic / never fails" 🥇 ⬜
Synthesize W1–W3 into the most robust mechanism. Candidate: an install-time
auto-init (postinstall/prepare that runs `astryx init --features agents --yes`)
with graceful degradation across npm/pnpm/yarn/CI, PLUS passive fallbacks
(README + `@see npx astryx init` in `.d.ts`) so no single channel is load-bearing.
- **Acceptance:** init-ran ≈ 100% with tight CI across ≥2 agents/PMs.

### W5 — Existing-project parity ⬜
Ensure adding Astryx to an **existing** app gets the same install/init. New
harness variant: seed the sandbox with a pre-existing Next.js (and a non-Next)
app, then run "add astryx design" → "build a to-do page". Measure init-ran there.
- **Acceptance:** existing-project init-ran matches the fresh-install rate.

---

## Orchestration (use subagents to preserve context)

- **base02** running in background (harness-managed).
- **Subagent A:** W3 prior-art research → `research/prior-art.md`.
- **Subagent B:** W-infra local Verdaccio registry + `--source local`, verified.
- Then: W1 (README) draft via subagent → publish via W-infra → measure.
- Then: W2, W4, W5 in sequence, each measured against baseline.

## Run commands

```bash
cd internal/vibe-tests/fresh-install-test
node run.mjs --reps 10 --exp <id>                 # baseline (public npm)
node run.mjs --reps 10 --source local --exp <id>  # candidate (local registry)  [after W-infra]
node score.mjs --exp <id>
```

## Methodology (tracking — v2)
- **Models tracked (2×2):** strong = GPT-5.5 (`gpt-5.5-high`) + Opus 4.8 (`claude-opus-4-8-high`); weak = GPT-5.2 (`gpt-5.2`) + Sonnet 4 (`claude-4-sonnet`). Haiku is not offered by cursor-agent on this account, so Sonnet 4 fills the "weak Claude" slot. Every data point runs ALL four.
- **Sample size:** n=12 per (model × commit) while iterating — cheap and enough to show a big needle-move with non-overlapping Wilson CIs. n=100 per model to CERTIFY the winner: "0 failures in 100" ⇒ ≥97% success (95% CI). Literal 100% is unprovable at finite n (rule of three: upper failure bound ≈ 3/n).
- **Decision rule:** a commit "moved the needle" only if its lower Wilson bound clears the prior point's upper bound (or ≥ +15 pts) — avoids chasing noise.
- **Tooling:** `run-matrix.mjs` runs a condition across all models → `scoreboard.mjs record` appends one per-model point (core/cli/init) → the canvas renders per-model line charts over commits. `scoreboard.mjs canvas-data` emits the embed block.
- Sonnet-5 (`base02`) dropped from tracking (not in the 2×2); its data stays in `aggregate.json` for reference.

## Measurement in TWO phases (fast dev → rigorous backtest)
Rigorous-first was too slow (Sonnet-4 maxes the turn timeout every rep, bottlenecking the whole matrix). Split it:
- **Phase A — dev (fast, noisy, throwaway):** while developing each commit, run ~1–3 reps on the FAST models (GPT-5.5, Opus, GPT-5.2), `--parallel-models`, just for a directional read ("does this change move init?"). Skip Sonnet-4 here (pathologically slow — turn-1 > 700s every time). NOT for publication.
- **Phase B — backtest (rigorous, for the post):** once commits are developed, replay the WHOLE timeline in one big batch — published versions 0.1.4→0.1.7, THEN commit-by-commit (baseline → c-tty → …) × all 4 models × high N (n=12; certify the winner at n=100), with a LARGE turn timeout so slow models finish cleanly. This produces the clean charts/data for the write-up.
- **Sonnet-4 caveat:** its short-timeout data is confounded (turn-1 cut off mid-install). Only trust Sonnet-4 numbers from Phase B (big timeout).

## Candidate commits — ranked hypotheses (what moves the needle)
Grounded in the baseline audit (3 off-ramps) + CLI source review:
- **H1 — bare `astryx init` fails headless.** `init.mjs` `requireInteractive()` errors with no TTY (the exact shell agents use). The README/instinct is `npx astryx init` → it errors → agent bounces to manual/`docs.mjs`. Fix: no-TTY ⇒ default to `--features agents`. Cheapest, likely biggest. 🥇
- **H2 — close the `docs.mjs` off-ramp + make init the only setup.** README still ships `## Component Docs` (docs.mjs) → component APIs without the CLI (Opus used it 4/6). Redirect to `npx astryx component`. 🥈
- **H3 — install-time auto-init (`postinstall` → `astryx init …`). ❌ RULED OUT (policy).** A silent dependency `postinstall` that writes `AGENTS.md`/`CLAUDE.md` into the consumer's tree is a norms/trust violation (unsolicited writes + git diffs, the supply-chain anti-pattern pnpm 10 blocks by default) AND unreliable (CI/`--ignore-scripts`/pnpm skip it). Do NOT ship. The distinction: writing on an **explicitly-invoked** command is fine (like `git init`); writing from a **silent install hook** is not.
- **H3′ (replacement) — first-run hook on the explicitly-run CLI (= H0).** The ethical "automatic": the agent already runs `astryx <cmd>` 63×; first run with no cheat sheet ⇒ CLI writes/offers it. Consented + rides the channel they use. Pair with passive in-package delivery (README + `node_modules/.../AGENTS.md` + `.d.ts @see`) which writes NOTHING to the user tree.
- **KPI note:** passive delivery gives the agent the cheat sheet WITHOUT a project marker — so the true KPI is "agent ends up with the cheat sheet / builds correct XDS code," not strictly "marker exists." Keep marker as the strong proxy but don't let it rule out no-write channels.
- **H4 — name/discoverability. DEPRIORITIZED (out of scope).** Core-package-name resolution is "out of our control": "astryx design" → wrong REAL packages (e.g. `astryx-ui@1.0.1`, which GPT-5.2 silently installed). Instead of a product fix, the vibe-test prompt now names `@astryxdesign/core` explicitly so name-guessing doesn't derail the CLI/init measurement. (A real-world naming fix — npm keywords / an alias package — could be a separate effort, NOT part of this PR series.)
- **Primary needle = `init ran` (marker).** `cli installed` lags when agents use ephemeral `npx astryx init`; a passive in-package `AGENTS.md` aids correctness but writes NO project marker (not a marker-mover).
- **H0 (from behavior mining) — first-run hook on the commands agents ACTUALLY use.** Across 20 baseline reps: `astryx component` ran **63×** vs `init` **2×** (one rep); 50% used core's `docs.mjs`, only 45% touched the CLI at all. Agents use the CLI as a *lookup* tool, not setup. So make ANY `astryx <cmd>` (esp. `component`/`search`) auto-write the cheat sheet when missing — ride the 63× channel instead of the ~0× `init`. Likely the top-fit lever.
- **Everything is on the table** (rename/reshape `init`, first-run hooks, auto-init, CLI restructure) — gated on the ratchet: a change ships only if it beats the anchor.
- **Order (revised):** c1 README (running, baseline signal) → c2 = H1 (init headless) + H2 (close docs.mjs) → c3 = H0 first-run hook and/or H3 auto-init → c4 name. Reorder as data dictates.
- **Probe — expected first command (clean /tmp, no repo rules), 4 models:** 3/4 NATURALLY reach for `astryx init` (GPT-5.5 & Sonnet-4 run it; GPT-5.2 does `--help` first, then "an init/setup command"). Opus REFUSES to guess an unknown CLI → runs none, inspects `bin`/README first. Reconciliation with behavior mining (`init` 2× vs `component` 63×): agents *say* init but in practice get **diverted by the README off-ramps** (manual setup + `docs.mjs`) and **blocked by the TTY bug** before their instinct fires. ⇒ **Do NOT rename `init`** (the name lands for 3/4). Fix: H1 headless, H2 remove off-ramps, H3 auto-init for cautious/non-CLI models (Opus). Also make `astryx --help` / `init --help` surface init + the non-interactive form (gpt-5.2 checks help first).
- **Isolation reminder:** probes/tests MUST run outside the worktree (a first probe run inside it inherited the repo's always-applied ASTRYX `CLAUDE.md` and gave contaminated, over-informed answers).

## Findings log

### ⚠️⚠️ Explicit-name prompt REMOVED exploration → baseline init 0% (major, needs a decision)
The explicit prompt ("install astryx-design core (@astryxdesign/core) …") fixed core-install (→100%) but **eliminated the exploration** (`npm search`/`view`/README) that drove CLI/init discovery. Fresh baseline (new prompt): GPT-5.5 & GPT-5.2 both **core 100% · cli 0% · init 0%**. Trail confirms: agents just `npm install @astryxdesign/core` + `npm run build`, never read docs or touch the CLI.
- This is the **harder, more realistic "install + build, never init"** scenario — arguably the true problem.
- **remove-tty helps only agents that RUN init** → it will likely show ~0 under this prompt (no init attempts). That is NOT a failure of remove-tty; it reveals that **DISCOVERY is the real gap** here, and it's worse when the agent has a direct install target.
- Even passive channels (README callout, `docs.mjs`, `@see`/.d.ts) may not reach an agent that installs + builds without reading anything.
- **Two scenarios exist:** (A) ambiguous/"astryx design" prompt → agents explore → discover → remove-tty measured 29→100 (GPT-5.5); (B) explicit-install prompt → no exploration → init 0, remove-tty ~null. **Need user's call on which scenario(s) to test** (or a middle-ground prompt like "set up astryx for AI-agent development"). The current autonomous run is scenario B.


- **pilot01** (n=1, Sonnet): core ✅ cli ✅ next ✅ styled ✅ · **INIT RAN: NO**. Built a
  fully working, styled Astryx to-do app *without ever running init* — even
  referenced `npx astryx component`/`template` in its summary but hand-wired
  setup from the README. The pathological case: knows the CLI, installs it,
  still skips init.
- **trace01** (n=1, Sonnet): **INIT RAN: YES** (`astryx init --all`), then used the
  CLI heavily. So published-package init is ~coin-flip (1/2 across pilots).
- **base02** (Sonnet-5): dropped from tracking (not in the 2×2).
- **Baseline (2×2, published package)** — the anchor; `astryx init` barely runs:
  - GPT-5.5 (n=7): core 86% · cli 29% · **init 29%**
  - Opus 4.8 (n=6): core 83% · cli 17% · **init 0/6** — audited every rep: not one even *attempted* init.
  - GPT-5.2 / Sonnet-4: collecting.
  - **Three off-ramps let a capable agent finish WITHOUT init:** (1) the README's full manual setup, (2) core's `docs.mjs` (component lookups without the CLI — the README advertises it), (3) name ambiguity ("astryx design" → one Opus rep installed the wrong `astryx` package). Fixes must close all three, or bypass them with install-time auto-init.
- **c1 staged:** README R1 published to the local rig (`0.99.0-foolproof.3`), ready to test.
- **Deferred to the END:** measure the last 4 published releases (0.1.4 → 0.1.7) as an earlier timeline segment — "how did each shipped version do on init?" — prepended before `baseline`/our fixes on the same per-model line charts. Needs rig `--base-version` (serve a specific old version as `latest`) + a `run-versions.mjs` loop. Parked until the ratchet reaches the ceiling.

### ⚠️ CLI friction discovered (affects every fix)
`packages/cli/src/commands/init.mjs` calls `requireInteractive()` for **bare
`astryx init`** — so in a headless/non-TTY agent shell the *most natural* command
(the exact one the README says: "run `npx astryx init`") **fails fast** instead of
running. There is no `--yes` flag (Commander, no `allowUnknownOption`), so
`astryx init --yes` is a parse error too. Only `astryx init --features agents` /
`--all` work non-interactively. Implications:
- The README/callout MUST show the non-interactive form (`--features agents` /
  `--all`), and W1's candidate does.
- **Candidate CLI fix (feeds W4):** make bare `astryx init` DEGRADE to a sensible
  non-interactive default (e.g. `--features agents`) when no TTY, instead of
  erroring — so agents that copy the bare command still succeed. This alone may
  lift the rate; worth its own A/B once the rig is up.
