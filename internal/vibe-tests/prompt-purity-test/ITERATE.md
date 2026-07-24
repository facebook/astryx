# ITERATE — autonomous prompt-purity search (driven by `/loop`)

This is the per-tick playbook for **automatically evolving the astryx-init prompt** until
agents reliably stop veering into raw CSS/Tailwind (or catch themselves when they do).
It is meant to be run by the `/loop` command, self-paced (no fixed interval), gated on
each harness run completing.

**Invocation** (from the repo root, in a live Cursor agent session):

```
/loop follow internal/vibe-tests/prompt-purity-test/ITERATE.md
```

No interval => dynamic mode: run one iteration now, then wake when the current harness
run finishes and run the next. This is FULLY AUTONOMOUS with NO iteration cap — it stops
only on a confirmed winner or a genuine plateau (see Stop conditions). Token spend is
accepted: a better shipped prompt saves far more downstream.

Prereq (once): the `cursor-agent` CLI must be logged in (`cursor-agent status`). If it
is not, stop and tell the user; do not loop.

---

## State (survives across ticks)

Keep a running log so each tick can compare against every prior attempt and never
re-test a wording:

- Path: `"$TMPDIR/astryx-purity/_loop/iterations-log.json"` (outside the repo, like all
  runtime artifacts). Create it on the first tick if absent: `{ "tick": 0, "champion":
"B-selfcheck", "history": [] }`.
- Each `history[]` entry: `{ tick, expId, ranConditions, variantHashes, rates: { <cond>:
{ veeredUncaught, caughtGivenVeered, finalPurityMean, n } }, note }`.
- "champion" = the best variant found so far (lowest `veeredUncaught`, tie-broken by
  higher `finalPurityMean`). Seed champion = `B-selfcheck`.

`A-control` is the immutable baseline — never edit `variants/A-control.md`.

---

## One tick

### 1. Read where we are

- Read `iterations-log.json`. Identify the current `champion`.
- If `history` is empty, this is the seed tick: run `A-control`, `B-selfcheck`,
  `C-strong` together (exploration settings below) to establish the baseline and pick
  the first champion. Skip step 2 on the seed tick.

### 2. Author ONE new challenger (skip on the seed tick)

- Based on the last run's per-run detail in `purity-summary.json` (which markers survived
  in `veeredUncaught` runs, whether `ranDocRetrieval` was low, whether catches happened
  late), write ONE new variant wording that targets the observed failure mode. Ideas to
  vary (change one axis at a time so you learn what matters):
  - imperative strength / ordering (self-check first vs last)
  - explicit marker checklist vs terse rule
  - mandating `astryx component`/`search` verification vs not
  - "re-read the file" framing vs "before you output" framing
  - length (a terse one-liner sometimes beats a wall of text)
- Write it to a NEW file `variants/g<NN>-<slug>.md` (never overwrite A/B/C or a prior
  generation — history must stay reproducible). Add a matching entry to
  `conditions.json` `conditions[]`: `{ "id": "g<NN>-<slug>", "role": "candidate",
"variant": "g<NN>-<slug>" }`.
- Do NOT test a wording whose text hash already appears in `history`.

### 3. Run (exploration = cheap, fast)

- Compare exactly THREE conditions so runs stay focused: control, champion, challenger.
- Explore settings: `--prompts dd-1,tc-6 --reps 3`.
- Start it in the BACKGROUND and arm the completion wake (dynamic `/loop`). Generate an
  id first so the wake payload carries it:

```bash
EXP=$(node -e "console.log(require('crypto').randomBytes(4).toString('hex'))")
( node internal/vibe-tests/prompt-purity-test/run-purity.mjs \
    --exp "$EXP" --conditions A-control,<champion>,<challenger> --prompts dd-1,tc-6 --reps 3 \
    --concurrency 6 ; \
  echo "AGENT_LOOP_WAKE_purity {\"expId\":\"$EXP\",\"phase\":\"explore\"}" ) 2>&1
```

Launch via the Shell tool with `block_until_ms: 0` and `notify_on_output` on
`^AGENT_LOOP_WAKE_purity`. Also arm ONE long fallback heartbeat (e.g. `sleep 1800`)
per the loop skill. Then END THE TURN — do not block.

### 4. On wake — evaluate

- Read `"$TMPDIR/astryx-purity/$EXP/purity-summary.json"`.
- Append a `history` entry (rates for each condition + variant hashes).
- Compare challenger vs champion: challenger becomes the new champion if its
  `veeredUncaught` mean is lower (tie-break higher `finalPurityMean`). Update `champion`.
- Report a one-line tick summary to the user: control vs champion vs challenger on
  `veeredUncaught`, `caughtGivenVeered`, purity — and whether the champion changed.

### 5. Decide: confirm, continue, or stop

- **Promote to confirmation** when the champion beats `A-control` in exploration
  (`veeredUncaught` lower AND purity higher). Run a CONFIRMATION:
  `--conditions A-control,<champion> --prompts dd-1,dd-5,wd-1,wd-4,tc-6,ps-1 --reps 7`
  (K>=5, full curated set), same background+wake pattern with `"phase":"confirm"`.
- On a confirmation wake: if the champion is **decisive** — its `veeredUncaught` Wilson
  upper bound is below control's lower bound AND mean purity is higher — go to Ship.
  Otherwise record it, keep searching (back to step 2).
- **Continue** (no interval): re-arm and start the next tick (step 2).

---

## Stop conditions

Stop the loop (kill any watcher/heartbeat PID, do not re-arm) when ANY holds:

- **Winner confirmed** — a champion passed the confirmation run decisively. Go to Ship.
- **Plateau** — the best `veeredUncaught` has not improved across the last 3 distinct
  challengers. Report the best-so-far; ship only if it also beats control decisively,
  else report that no variant reliably beats control and hand back to the user.
- **Floor** — `A-control` already shows ~0 `veeredUncaught` on the confirmation set
  (nothing to fix); report and stop.
- The user says stop.

---

## Ship (only after a confirmed winner)

This completes Phase 4 / the `ship` to-do:

1. Bake the winning wording into `generateCompressedIndex()` in
   `packages/cli/src/commands/agent-docs.mjs` — add the self-check lines to the emitted
   block (respect the `stylex` / `tailwind` / `css` styling-system branches).
2. Update the test `packages/cli/src/commands/agent-docs.test.mjs` to assert the new
   self-check text is present in the generated index.
3. Run the CLI tests for that file.
4. Report: the winning variant text, its confirmation rates vs control, and the diff.
5. Stop the loop.

---

## Reporting & safety

- Every tick: emit a short status (which conditions ran, the funnel deltas, champion
  change, next action). On stop: say why and give the final winner + rates.
- All runs stay under `"$TMPDIR/astryx-purity"` (never the repo), so parallel Cursor
  work, file-watchers, and `git status` are untouched. Only `conditions.json` +
  `variants/g*.md` (and, on Ship, the two CLI files) change in the repo.
- Never edit `variants/A-control.md`. Never place `expectedComponents` in any prompt.
- One loop only — before arming, check for an already-running `AGENT_LOOP_WAKE_purity`
  watcher and reuse it.
