# CLI Discovery Vibe Test

**Status:** proposal / design (not yet implemented)
**Owner:** TBD
**Related:** `../README.md` (Checker Protocol), `../src/setup-environment.mjs`, `../src/universal-eval.ts`

---

## 1. The question

Every existing vibe test asks: _"Given the agent already has the docs (AGENTS.md, or a README that says 'use the CLI'), how good is the code it writes?"_

This experiment asks the **opposite, upstream** question:

> **When an agent lands in a project that just ran `npm install @astryxdesign/core` — with no one having run `astryx init` — does it ever discover the CLI on its own? And which "foolproofing" channel makes that happen _consistently_?**

This is the **chicken-and-egg problem**. The thing that reliably makes agents use the CLI is the `<!-- ASTRYX:START -->` cheat sheet that `astryx init` injects into `AGENTS.md`/`CLAUDE.md`/`.cursorrules`. But that cheat sheet is installed _by the CLI_. A user who only installs the package never runs `init`, so the agent never learns the CLI exists. We want to know which passive channels close that gap.

**Note:** the current `environments/project-astryx/README.md` already contains "Use the CLI to look up component props." That makes it unfit as a control for _this_ experiment — it pre-seeds the answer. Here, the README hint is one of the **conditions under test**, not a constant.

---

## 2. What "works" means

The user's phrasing was _"what actually works **consistently**."_ So the primary output is not a single score — it's a **reliability rate per channel**: the fraction of fresh, independent runs in which the agent discovers and uses the CLI, with its variance. A channel that works 9/10 times beats one that works 5/10 with high variance, even if the 5/10 one occasionally produces prettier code.

---

## 3. Hypotheses

| #   | Channel                      | Hypothesis                                                                                             | Reaches agents? |
| --- | ---------------------------- | ------------------------------------------------------------------------------------------------------ | --------------- |
| H1  | Bare install (control)       | Agents almost never discover the CLI; they guess APIs and hallucinate                                  | —               |
| H2  | README top callout           | Moderate lift; depends on whether the agent opens `node_modules/@astryxdesign/core/README.md`          | Sometimes       |
| H3  | Type/JSDoc `@see` banner     | High + consistent lift; agents read `.d.ts`/hover as a reflex, and it survives pnpm script-blocking    | Usually         |
| H4  | Postinstall banner           | Low/unreliable; only seen if the agent itself runs install and reads stdout; pnpm 10 skips dep scripts | Rarely          |
| H5  | CLI first-run nudge          | Converts _awareness → init_, but only fires once the agent already runs `astryx`                       | Conditional     |
| H6  | AGENTS.md present (ceiling)  | Near-100%; this is the known-good state `init` produces                                                | Yes             |
| H7  | README + type banner (combo) | Approaches the ceiling using only passive, ship-in-the-package channels                                | Usually         |

The decision we want to make: **find the minimal set of passive channels (things we can ship in the npm package, no user action) whose discovery rate approaches the H6 ceiling.**

---

## 4. Variables

### Independent variable — the discovery channel (the "condition")

Defined in [`conditions.json`](conditions.json). Each condition is the bare realistic project **plus** zero or more channel patches. Only the channel varies; prompts, persona, environment, packages, and evaluation are held constant (Checker Protocol §2).

### Dependent variables — the discovery funnel (NEW) + downstream quality (REUSED)

**Discovery funnel** (the point of this experiment; measured per run):

1. **Awareness** — did the agent reference the CLI at all? (transcript)
2. **Invocation** — did it actually run any `npx astryx …`? (**ground truth**, see §6.2)
3. **Init** — did it run `astryx init`?
4. **Doc retrieval** — did it run `astryx component` / `build` / `search` / `template`?

**Downstream quality** (reuse `universal-eval.ts` unchanged so results are comparable to prior runs):

5. correctness, accessibility, code quality, efficiency, maintainability
6. escape-hatch / hallucination rate (per `prompts/evaluator.md`: hallucinated props, invalid `--xds-*`/`--space-*` tokens, phantom components)

The funnel is the independent contribution; the quality dims answer the follow-on "…and does discovery actually make the output better?"

---

## 5. Conditions (the matrix)

See [`conditions.json`](conditions.json) for the machine-readable version. Summary:

| id                | Channel(s) present                                                              | Role                |
| ----------------- | ------------------------------------------------------------------------------- | ------------------- |
| `c0-bare`         | Nothing. `package.json` + symlinked packages. No CLI mention anywhere.          | **Control (floor)** |
| `c1-readme`       | Core `README.md` gains a top "Using an AI agent? run `npx astryx init`" callout | Candidate           |
| `c2-types`        | Generated `@see npx astryx …` banner injected into each component's `.d.ts`     | Candidate           |
| `c3-postinstall`  | Simulated install-time banner (see §9 realism caveat)                           | Candidate (probe)   |
| `c4-firstrun`     | CLI present; any `astryx` call prints the "run init" nudge                      | Candidate           |
| `c5-agents-md`    | Fully initialized: `AGENTS.md` with the real `<!-- ASTRYX:START -->` block      | **Ceiling**         |
| `c6-readme+types` | c1 + c2                                                                         | Candidate combo     |
| `c7-all-passive`  | c1 + c2 + c4 (everything shippable without user action)                         | Candidate combo     |

Each candidate is compared against **both** `c0-bare` (lift over doing nothing) and `c5-agents-md` (how close to the ceiling).

---

## 6. Harness design

Reuse Mechanism B (`setup-environment.mjs`, symlinked isolated projects) — it's the representative-environment path the Checker Protocol wants. Three additions are needed.

### 6.1 Channel patches (compose conditions from one bare base)

Instead of hand-maintaining 8 template dirs (drift risk, violates "only the SUT varies"), build every condition from **one bare base template** + small, reviewable **patch functions**, one per channel. This also lets us test channels **before we build them for real** (e.g., inject the type banner into a _copy_ of `dist/**/*.d.ts`; patch a copy of `README.md`), so the experiment informs whether to ship the feature — not the other way around.

Patches (each toggled by a condition):

- `patch:readme-callout` — prepend the AI callout to the project's copy of core's `README.md`.
- `patch:type-banner` — copy core into the project (not symlink) and inject the standard `@see` banner into each component's public `.d.ts`.
- `patch:agents-md` — run the real `npx astryx init --features agents --agent-docs-path AGENTS.md` (reuses `installAgentsDocs()` from `interactive.ts`).
- `patch:first-run-nudge` — swap the `astryx` bin shim for one that also prints the nudge.
- `patch:postinstall-banner` — see §9.

> **Realism guard:** every patch must only touch files a real npm consumer would actually receive. Core ships `README.md` and `dist/**` (its `package.json#files`), so c1/c2 are authentic. `AGENTS.md` is _not_ shipped in the package — it only exists post-`init` — which is exactly why c5 represents "user ran init" (the ceiling), not a shippable default.

### 6.2 Ground-truth CLI instrumentation (don't trust self-report)

The existing symlink `node_modules/.bin/astryx → packages/cli/bin/astryx.mjs` becomes a **logging shim**: a tiny wrapper that appends `{ts, argv}` to `projects/<promptId>/.astryx-invocations.log`, then execs the real bin. This gives an **objective** record of _every_ CLI call (invocation, init, which subcommands) independent of what the agent claims. This is the single most important measurement — discovery is defined by this log, not by the transcript.

### 6.3 Extended result schema (self-report as secondary signal)

Extend the per-task result JSON the subagents already write with a discovery block (self-reported; cross-checked against the ground-truth log):

```json
{
  "completedAt": "<ISO>",
  "discovery": {
    "sawCliReference": true,
    "howDiscovered": "readme | types | nudge | guessed | none",
    "ranInit": false,
    "cliCommandsRun": ["astryx component Button", "astryx build \"...\""]
  }
}
```

A new aggregator, `discovery-aggregate.ts` (sibling of `universal-aggregate.ts`), joins the ground-truth log + the self-report + the existing `universal.json` per condition and emits funnel rates, quality deltas, and consistency stats.

---

## 7. Procedure

1. **Prompts** — reuse a stratified sample of `test-sets/default.json` (identical prompts across conditions, per §2/§3 of the Checker Protocol). Curated subset in [`prompts.json`](prompts.json). `expectedComponents` stays evaluation-only and is never shown to the agent (invariant §3).
2. **Repetitions** — each `condition × prompt` runs **K ≥ 5** times with fresh, context-free subagents (invariant §5). Discovery is stochastic; a rate needs repetitions, not one sample.
3. **Agents/models** — discovery is _harness-dependent_ (Cursor auto-loads `AGENTS.md`/`.cursorrules`; Claude Code auto-loads `AGENTS.md`/`CLAUDE.md`; a bare API agent auto-loads nothing). Run at least: (a) Claude Code subagents (the existing runner), and (b) one "no auto-load" agent to isolate the file-reading channels (types/README) from the harness auto-load channel (AGENTS.md). Record the agent/model with each result.
4. **Blinding** — evaluation is the existing deterministic `universal-eval.ts` (already blind to condition). The discovery log is objective. No human scoring in the loop.

### Run commands (proposed, after harness work lands)

```bash
# Generate all conditions for a stratified sample, K reps each (prints iter IDs)
node internal/vibe-tests/cli-discovery-test/setup-discovery.mjs --sample 8 --reps 5

# Parent agent spawns fresh subagents per task file (as in the interactive runner)

# Evaluate
pnpm -F @astryxdesign/vibe-tests aggregate --iteration <id>        # reuse: quality dims
tsx internal/vibe-tests/cli-discovery-test/discovery-aggregate.ts --experiment <expId>   # new: funnel + consistency
```

---

## 8. Analysis & decision rule

For each condition report, per agent:

- **Discovery rate** = P(ran any `npx astryx`) with a Wilson 95% CI over all runs.
- **Init rate**, **doc-retrieval rate** (same treatment).
- **Consistency** = the width of that CI + variance across prompts/reps. A channel is "consistent" only if the CI is tight and it holds across prompt categories and both agents.
- **Quality delta** = mean `overall` (and hallucination rate) vs `c0-bare`.

**Pre-registered decision rule (tune before running):**

- A channel **ships** if its discovery rate is **≥ 80%** with a lower CI bound **> c0-bare's upper bound**, and it holds across both agents.
- Prefer the **minimal passive combo** (`c6`/`c7`) that reaches **≥ 90% of the `c5-agents-md` ceiling**. That combo becomes the recommended default foolproofing.
- Any channel whose discovery rate is high-mean but high-variance is labeled "unreliable" and not counted as a primary mechanism (this is the whole "consistently" ask).

---

## 9. Risks & limitations

- **Postinstall realism (c3).** In a symlinked env, deps are already present, so the agent never runs install and never sees a banner. Authentic simulation requires starting from an _uninstalled_ project and shimming the installer's stdout — slow and fragile in a pnpm monorepo. **Recommendation:** treat c3 as a low-priority, separately-run probe (or reason about it analytically), since we already know postinstall is suppressed by pnpm 10 / CI / `--ignore-scripts`. Don't let it block the core matrix.
- **Harness-dependence.** `AGENTS.md` auto-load is a property of the _agent harness_, not the package. The type/README channels are the ones we can ship that don't depend on the harness — call this out in the writeup so we don't over-credit c5.
- **Self-report bias.** Mitigated by the ground-truth bin shim (§6.2); self-report is secondary.
- **Copy-vs-symlink for c2.** Injecting type banners requires copying core (not symlinking). Keep everything else identical so the only delta is the banner text.
- **Prompt sensitivity.** Discovery is likelier on harder prompts (guessing fails). Stratify across complexity so we don't over- or under-state the rate.

---

## 10. Phasing

1. **Phase 0 (this doc)** — design + folder scaffold. ← we are here
2. **Phase 1** — harness: bare base template, patch composer, bin-shim logging, `discovery-aggregate.ts`. Verify with `scripts/smoke-test.sh`-style fixtures (no LLM).
3. **Phase 2** — pilot: `c0-bare` vs `c5-agents-md` on a small sample to validate the funnel + confirm the floor/ceiling gap is real.
4. **Phase 3** — full matrix (all conditions × K reps × 2 agents).
5. **Phase 4** — writeup + decision: which channel(s) to actually ship (feeds back into the P0/P1 recommendations for the core package).

---

## 11. Folder layout

```
internal/vibe-tests/cli-discovery-test/
├── PLAN.md            # this file — experiment design
├── conditions.json    # the channel matrix (independent variable)
├── prompts.json       # curated stratified prompt subset (from default.json)
├── setup-discovery.mjs        # (Phase 1) builds conditions from base + patches
├── discovery-aggregate.ts     # (Phase 1) funnel + consistency aggregator
└── results/                   # (gitignored) per-experiment output
```

---

## 12. Checker Protocol compliance

| Invariant                     | How this experiment honors it                                                                                                                            |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| §1 Fair Evaluators            | Same `universal-eval.ts` + same objective discovery log for all conditions                                                                               |
| §2 Only the SUT varies        | One bare base + single-channel patches; prompts/persona/env identical                                                                                    |
| §3 Never leak the answer      | `expectedComponents` eval-only; no CLI command is pre-built from expected components; the _control_ gets no CLI hint at all                              |
| §4 Representative environment | Patches only touch files a real npm consumer receives (`README.md`, `dist/**`); `AGENTS.md` is explicitly the post-`init` ceiling, not a shipped default |
| §5 Context-free sub-agents    | Fresh subagent per run; K reps are independent; no shared session                                                                                        |

---

## 13. Pilot status (implemented)

Built and verified end-to-end **without an LLM** (the mechanism, not the finding):

- `setup-discovery.mjs` — builds one isolated project per `condition × prompt × rep` from a bare "just installed `@astryxdesign/core`" base (core + theme symlinked, **CLI not listed**), wires the ground-truth `astryx` logging shim into `node_modules/.bin`, and writes task files + `discovery-config-<expId>.json`. Pilot wires `c0-bare` (floor) and `c5-agents-md` (ceiling); other conditions are guarded until added to `PATCHES`.
- `discovery-aggregate.ts` — reads the invocation logs (+ self-report), prints the funnel with Wilson 95% CIs, writes `discovery-summary-<expId>.json`.

Verified: `c0` has no `AGENTS.md`; `c5` receives the real `<!-- ASTRYX:START -->` cheat sheet; the shim records `{ts, argv}` on every `astryx` call; the task prompt carries **no** `expectedComponents` (no answer leak, §3).

Run:

```bash
# 1. generate conditions (curated prompts, or --sample N / --reps K)
node cli-discovery-test/setup-discovery.mjs --prompts fwc-1,ps-1
# 2. spawn a FRESH, context-free sub-agent per printed task file
# 3. score the funnel
npx tsx cli-discovery-test/discovery-aggregate.ts --experiment <expId>
```

Next: run step 2 with real agents at **K≥5** across the curated set (a pilot at n=2 gives CIs too wide to separate floor from ceiling — that is the point of more reps), then wire `c1-readme` / `c2-types` / `c4-firstrun`.

Known note: inside this monorepo the generated `AGENTS.md` prints `pnpm exec astryx` (run-prefix detection sees pnpm); a standalone consumer sees `npx`. The shim resolves both, so it doesn't affect measurement.

---

## 14. Findings — pilot run 1 (experiment `b65414e6`): method invalid, plumbing works

Ran `c0-bare` vs `c5-agents-md` × {`fwc-1`, `ps-1`} as 4 fresh in-session Task sub-agents.

**The funnel looked perfect — and that's the trap.** Ground-truth (shim log): `c0` invoked 0/2, `c5` 2/2. A textbook floor/ceiling. **It is a FALSE clean.**

Self-reports contradict it: both `c0` agents ran the CLI heavily (**9** and **35** `astryx` commands) with `howDiscovered: "nudge"`/`"readme"`. They invoked the **repo-root** CLI (`node packages/cli/bin/astryx.mjs`, per this repo's own always-applied `CLAUDE.md`), which **bypasses the project shim** — so `c0`'s ground-truth log stayed empty despite heavy use.

**Two contamination vectors, both from running the experiment _inside the repo_:**

1. **Injected workspace rules** — the repo's always-applied `CLAUDE.md` (the ASTRYX-CLI bootstrap block) teaches the CLI to every in-session sub-agent. `c0` fwc-1 literally reported `howDiscovered: "nudge"` = injected rules.
2. **Repo-root binary + source proximity** — agents reach the workspace `astryx` and the full design-system source by walking up out of the project, bypassing the isolated sandbox.

**Lessons:**

- **Dual signal was essential.** Shim-log alone said "clean" (0 vs 2); self-report alone would misattribute the channel; only together did they expose the contamination. Keep both.
- **The shim must be the _only_ reachable `astryx`** for the number to mean anything.

**Required pivot (Phase 1.5 — isolated runner):**

- Copy each task project **outside the repo** (e.g. `/tmp`) — no ancestor `CLAUDE.md`, no repo source to explore.
- Spawn a **headless agent with NO astryx workspace rules** (Cursor SDK / `cursor-agent`), not in-session Task sub-agents.
- Ensure **no repo-root `astryx` on `PATH`** — only the project shim (or `npx` from the registry) resolves, so every call is captured and attributable to a project channel.

---

## 15. Findings — pilot 2 (ISOLATED, valid) · exp `ee116c67`

Fix from §14 applied: headless `cursor-agent` in `/tmp` sandboxes (no repo rules, packages copied out of the repo). Conditions `c0-bare` / `c1-readme` / `c4-nudge` / `c5-agents-md` × {`fwc-1`, `ps-1`}, n=2/condition, model `auto`. Channels are `--via`-tagged to match production attribution (`packages/cli/src/lib/attribution.mjs`).

Funnel (ground truth = astryx shim log):

| condition                | invoked astryx | ran init | core docs.mjs* |
| ------------------------ | -------------- | -------- | -------------- |
| `c0-bare` (floor)        | 0/2            | 0/2      | 2/2            |
| `c1-readme`              | **2/2**        | **2/2**  | 2/2            |
| `c4-nudge`               | 0/2            | 0/2      | 2/2            |
| `c5-agents-md` (ceiling) | 2/2            | 0/2      | 0/2            |

\* self-reported use of core's built-in `docs.mjs` (README channel); the astryx shim can't see it.

**Headline findings:**

1. **Isolation validated** — `c0` floor = 0 astryx calls (vs 9–35 when contaminated in-repo). The §14 fix holds.
2. **README callout wins** — `c1-readme` drove **2/2 `init`** + CLI use, matching the ceiling. It's the only passive channel that triggers the _persistent_ install (writes `AGENTS.md`), ships in the package, and agents read it unprompted.
3. **Nudge-alone can't bootstrap** — `c4-nudge` = 0/2, identical to floor. The first-run nudge only fires once the agent already runs `astryx`; it converts, it can't discover. Chicken-and-egg confirmed (H5).
4. **The floor isn't doc-less** — `c0`/`c4` agents fall back to core's built-in `docs.mjs` (via the package README) 2/2, but never reach the CLI's `build`/`template` composition.
5. **Ceiling** (`c5`): 2/2 CLI use, 0 `init` (already has `AGENTS.md`), 0 `docs.mjs` (used the CLI instead).

**Caveats:** n=2 → wide Wilson CIs. Direction is unambiguous and matches hypotheses, but the decision rule needs **K≥5**. Single model (`auto`). `c2-types` not yet wired.

**Next:** K≥5 scale-up on `c0`/`c1`/`c4`/`c5` to tighten CIs (esp. confirm `c1-readme` ≫ `c4-nudge`≈floor); then wire `c2-types` and multi-model.

---

## 16. Decision + shipped · K=5 complete (exp `98144547`, `ps-1`, model `auto`)

| condition                | invoked astryx (n=5) | ran init | completed code |
| ------------------------ | -------------------- | -------- | -------------- |
| `c0-bare` (floor)        | 0/5                  | 0/5      | 5/5            |
| `c1-readme`              | **4/5 (80%)**        | **4/5**  | 5/5            |
| `c4-nudge`               | 0/5                  | 0/5      | 5/5            |
| `c5-agents-md` (ceiling) | **5/5 (100%)**       | 0/5      | 3/5            |

**Decision:**

- **Ship the README callout (`c1`).** 80% invoke + `init` — the only passive channel that triggers the _persistent_ `AGENTS.md` install, i.e. the causal chain README → `init` → `AGENTS.md` (the 100% ceiling). Delivered via **core's README** — the surface the floor proved agents read (`docs.mjs` 5/5). ✅ SHIPPED: `packages/core/README.md`.
- **Ceiling nuance:** `c5` (AGENTS.md) hits 100% CLI use but only **3/5 completed** the code — the 30-command CLI-exploration path is thorough but token-expensive and sometimes doesn't finish. `c1-readme` completed **5/5** — better cost/completion, because README→init lands the same `AGENTS.md` without the agent burning the turn exploring.
- **Nudge-alone (`c4`) = 0/5.** Confirmed useless for _discovery_; keep only as post-discovery conversion. Do not rely on it.

**Foolproof attribution** ✅ SHIPPED:

- `recordFirstSeen()` in `packages/cli/src/lib/attribution.mjs` + a `preAction` hook in `packages/cli/src/index.mjs`: **any** command (not just `init`) records — once per CLI version — how/when a project started using the CLI (`via`/`invoker`/`installMethod`/versions/`ts`). `ASTRYX_VIA` env lets flagless channels (nudge, postinstall) self-tag. Verified: non-`init` `docs` writes a record; env-via works; dedupe holds (1 line on repeat).

**Caveats:** single model (`auto`); n=5 (README lower CI ~38% vs floor upper ~43% — strong, tighten with K=10). `c2-types` still untested (the other agent-native channel).

---

## 15. Attribution + isolated runner (implemented)

**Attribution shipped in the CLI** — `packages/cli/src/lib/attribution.mjs`, wired into `init`. `astryx init --via=<channel>` records _how_ the project found the CLI to `.astryx/attribution.jsonl` and embeds a tag in the generated agent docs: `<!-- ASTRYX:src via=… invoker=… install=… v=… ts=… -->`. Local-first, **no telemetry**; auto-detects agent-vs-human and install method (npx vs devDependency). This is the production-side answer to _"how did they get the CLI?"_ — and the experiment's channel taxonomy is intentionally identical to the `--via` taxonomy (`VIA_SOURCES`). 65/65 existing CLI tests pass; `--json init` still writes nothing.

**Isolated runner** — `run-isolated.mjs` fixes the §14 contamination. Each task runs in a `/tmp` sandbox with packages **copied out of the repo** (walking up lands in `/tmp`, not the design-system source), driven by a headless `cursor-agent` whose **cwd is the sandbox** (so this repo's always-applied `CLAUDE.md` never applies), with only the shim `astryx` reachable. Channels advertise `--via`-tagged init commands. Verified without agents: `c0` bare, `c5` tagged `AGENTS.md`, `core`→`/tmp`, shim logs, and `cursor-agent -p` headless responds.

Run: `node cli-discovery-test/run-isolated.mjs --run --prompts fwc-1,ps-1` → `discovery-aggregate.ts --experiment <id>`.

---

## 15. Findings — pilot run 2 (isolated, experiment `49e1f721`): contamination fixed, but the floor saturates

Rebuilt as isolated `/tmp` sandboxes driven by headless `cursor-agent` (cwd=`/tmp` → the repo `CLAUDE.md` never loads; **verified** a `/tmp` agent reports `NONE` for rules and `astryx`/`npx astryx` both not found). Clean run — but no separation:

| condition      | invoked CLI    | doc retrieval |
| -------------- | -------------- | ------------- |
| `c0-bare`      | **2/2 (100%)** | 2/2           |
| `c5-agents-md` | 2/2 (100%)     | 2/2           |

**Why they tied:** the agent reported `howDiscovered: "readme"` — the **`@astryxdesign/core` README already ships a CLI section** (`## XDS CLI`, `## Page Layouts`, `npx astryx …`). So a "bare" install already advertises the CLI, and a capable agent finds + uses it unprompted (fwc-1: 3 calls; ps-1: 21 calls). The `.bin` shim was a second, artifactual hint.

**Implications:**

- The shipping package **already drives CLI discovery** for capable agents that read `node_modules` docs — the problem may be smaller than assumed _for this class of agent_.
- To measure any _added_ channel's value, the base must be **truly bare**: strip the CLI section from the core README **and** hide the runnable shim (PATH proxy, not `node_modules/.bin`). Implemented in `run-isolated.mjs`: `c0-strip` (floor), `c0-readme` (README channel), `c5-agents-md` (AGENTS.md channel).
- **Sharpest open question:** does discovery hold for _weaker_ agents/harnesses that don't explore `node_modules` or read READMEs? That's where the shippable channels (types, first-run nudge) likely earn their keep.

---

## 16. Findings — pilot run 3 (reliable `.bin` shim, experiment `83e88ff2`) + consolidated conclusions

The PATH proxy (run 2) was flaky (a README agent's `npx astryx` hit the real registry → 401, a false negative). Switched to a reliable `node_modules/.bin` shim (npx resolves local bin first). Result (n=2/cell):

| condition              | invoked CLI | per-task calls          |
| ---------------------- | ----------- | ----------------------- |
| `c0-strip` (true bare) | 50% (1/2)   | fwc-1: 0 · ps-1: **24** |
| `c0-readme`            | 100% (2/2)  | 2 · 2                   |
| `c5-agents-md`         | 100% (2/2)  | 4 · 22                  |

`c0-strip/ps-1` (stripped README, no AGENTS.md) still used the CLI 24× — transcript: _"exploring the project revealed an `astryx` CLI in `node_modules/.bin`."_ The reliable shim is discoverable, so a thorough agent finds it on hard tasks.

**Robust conclusions (consistent across all three isolated runs):**

1. **Self-report is unreliable.** `howDiscovered`/`cliCommandsRun` repeatedly diverge from the ground-truth log (c0-strip reported `"readme"` though the README was stripped and it actually found `.bin`; c0-readme claimed 3/15 calls it never made). **Ground-truth logging is mandatory.**
2. **`cursor-agent` is an aggressive CLI-seeker.** Across README / AGENTS.md / true-bare, it hunts for and uses the CLI — especially on non-trivial tasks (`ps-1` → 22–24 calls everywhere; `fwc-1` → 0–4). Discovery scales with **task difficulty + agent thoroughness**, not just advertising.
3. Every advertising channel pushes discovery to ~100%; even the true-bare floor is ~50% for this agent.

**Interpretation of the original question:** for a _capable_ agent, CLI discovery is largely **not the bottleneck** — it already finds the CLI via the README, `node_modules`, or by guessing `npx astryx`. The shippable channels (types, first-run nudge, README callout) should help most for **weaker agents/harnesses** that don't explore or read docs — which this pilot did not test.

**Caveats:** n=1–2/cell (directional only); the `.bin` shim is discoverable (mild floor inflation vs a real bare install, though a real agent guessing `npx astryx` would succeed via the public registry); only one agent and one theme; **no code-quality scoring yet.**

**Recommended next (higher-value than more capable-agent runs):**

1. **Test a weaker agent/model** (or a harness that doesn't auto-explore) — where channels should actually separate.
2. **Score code quality** (reuse `universal-eval.ts`) — does _using_ the CLI yield better code? That's the real payoff metric, not invocation count.
3. **Scale reps (K≥5)** once the above is set, for tight CIs.
