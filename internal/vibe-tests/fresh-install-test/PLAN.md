# Fresh-install discovery test

**Status:** implemented (Phase 1: baseline measurement)
**Related:** `../cli-discovery-test/PLAN.md` (the symlink-based sibling), `../README.md` (Checker Protocol)

---

## 1. The problem

People run `npm install @astryxdesign/core` and start building with an AI agent —
but nobody runs `astryx init`. Without `init`, the `<!-- ASTRYX:START -->` cheat
sheet never lands in `AGENTS.md`/`CLAUDE.md`, so the agent never learns the CLI
exists and guesses component APIs / tokens instead.

> **Question:** in a real cold start — empty project, agent installs the package
> itself, no hints — how often does the agent install the CLI and run
> `astryx init` on its own? And what would make that happen **100% of the time**?

This is the sibling of `cli-discovery-test`, with two deliberate differences:

1. **Real fresh install, not a symlinked sandbox.** The agent actually runs
   `create-next-app` + `npm install @astryxdesign/…` from the **public npm
   registry**, so we measure the exact channels a real user's package ships
   with today (README callout, whatever postinstall exists, etc.).
2. **Two-turn conversation, verbatim, Sonnet.** The prompts are the entire
   input — no scaffolding, no mention of the CLI:
   - Turn 1: `install astryx design and make a new NextJS app with the astryx design package`
   - Turn 2: `build a to-do app`

---

## 2. What "works" means

The headline metric is **INIT RAN**: the fraction of independent reps in which a
`<!-- ASTRYX:START -->` (or legacy `<!-- XDS:START -->`) block ends up in an
agent-doc file. Only `astryx init` writes that marker, so its presence is
**definitive, self-reported-proof-free** evidence that init ran. "Foolproof"
means this rate reaches ~100% with a tight Wilson CI.

Secondary signals: CLI installed, core installed, Next app created, styles wired.

---

## 3. Harness

- **Isolation (per cli-discovery-test §14):** each rep is an **empty dir under
  `os.tmpdir()`**. No ancestor `CLAUDE.md`/`AGENTS.md` from this repo, no
  design-system source to explore — the only way to learn the CLI is the shipped
  package. Verified: no global (`~`) agent rules mention astryx.
- **Registry:** the machine default registry is the Meta-internal mirror (401s
  for `@astryxdesign/*`). The runner routes installs to **public npm** via
  `npm_config_registry` so the agent gets the real published package (currently
  `@astryxdesign/core@0.1.x`). There is no scoped `@astryxdesign` override in
  `~/.npmrc`, so this is a clean redirect.
- **Agent:** headless `cursor-agent -p --output-format json --force --trust
  --sandbox disabled --model <sonnet>`, **cwd = the sandbox** (so this repo's
  always-applied rules never load). Default model `claude-sonnet-5-high`.
- **Two turns, one session:** turn 1 returns a `session_id` (JSON output); turn 2
  runs with `--resume <session_id>`, so it's a continuing conversation.
- **Scoring is file-based** (`score.mjs`) — it inspects the resulting sandbox, not
  the transcript. The agent's closing summaries are kept for debugging only.

### Files

```
fresh-install-test/
├── PLAN.md         # this file
├── prompts.json    # the two verbatim turns (single source of truth)
├── run.mjs         # driver: N reps × 2-turn Sonnet in /tmp sandboxes
├── score.mjs       # file-based funnel scorer (Wilson CIs)
└── results/        # (gitignored) manifest-<id>.json + summary-<id>.json
```

---

## 4. Run

```bash
cd internal/vibe-tests/fresh-install-test

# baseline: 5 reps, Sonnet, from public npm
node run.mjs --reps 5

# more reps, tune concurrency (each rep = create-next-app + install + 2 turns)
node run.mjs --reps 10 --concurrency 3 --model claude-sonnet-5-high

# score
node score.mjs --exp <expId>          # printed by run.mjs
node score.mjs --dir /tmp/astryx-fresh-install/<expId>/rep-1   # one sandbox
```

Flags: `--reps` `--model` `--concurrency` `--registry` `--turn-timeout` (s, per
turn) `--exp` (reuse an id). Sandboxes persist under
`/tmp/astryx-fresh-install/<expId>/` for inspection.

---

## 5. Measurement (ground truth on disk)

| Signal          | How it's detected                                                            |
| --------------- | ---------------------------------------------------------------------------- |
| core installed  | `@astryxdesign/core` in a `package.json` and/or `node_modules`               |
| CLI installed   | `@astryxdesign/cli` in a `package.json`, or `node_modules/.bin/astryx`       |
| Next app        | `next` dependency or `next.config.*`                                         |
| **INIT RAN**    | `<!-- ASTRYX:START -->` / `<!-- XDS:START -->` in AGENTS.md/CLAUDE.md/etc.   |
| styles wired    | a CSS/TS file imports core `reset.css` **and** `astryx.css`                  |

---

## 6. Testing fixes (Phase 2)

Baseline (§4) measures the **currently published** package. To test a
*foolproofing change* (e.g. a stronger README callout, a postinstall banner, a
`@see` type banner, or having `core` pull in the CLI + auto-run
`init --features agents`), the agent must install the **modified** package, which
means serving a local build under the name `@astryxdesign/core`:

- Stand up a local **Verdaccio** registry, `npm publish` the worktree's
  `packages/{core,cli,themes/neutral}` to it, and point `--registry` at it.
- Everything else (prompts, isolation, scoring) stays identical, so only the SUT
  (the package) varies — the "candidate vs. published baseline" comparison.

`run.mjs --source local` is the reserved hook for this and currently errors out
with a pointer here.

---

## 7. Candidate foolproofing channels (to evaluate in Phase 2)

Ranked by expected reliability × shippability (passive = no user action):

1. **`postinstall` that auto-runs `astryx init --features agents`** — highest
   reliability (no agent decision needed), but writes files on install; needs
   `core` to reach the CLI. The most likely path to literal 100%.
2. **`postinstall` banner** telling the agent to run `astryx init` — cheaper, but
   only seen if the agent (not a lockfile install) triggers it and reads stdout;
   pnpm 10 skips dependency scripts.
3. **Stronger README callout** — already shipped; baseline tells us its ceiling.
4. **`@see npx astryx init` banner in `.d.ts`** — agents read types reflexively;
   survives script-blocking.

The baseline number decides how much lift is actually needed.
