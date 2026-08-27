# Visual gate

Screenshots every theming target the design system claims to support, compares
them against an accepted baseline, and answers one question before a release
goes out: **did anything change on screen, and did we mean it?**

Not part of PR CI — it costs minutes, not seconds. It runs once a day
(`.github/workflows/release-gate.yml`, 06:00 PT) ahead of the 08:00 PT release
cut, and on demand. The two-hour margin is for the a11y leg, which audits every
story and has taken ~57 minutes; the visual leg is ~15.

## Why it exists

A theme binds to components through theming targets: a stable class plus the
variant and state data on it. `astryx theme build` validates that an override
KEY exists, so a renamed target is caught at build time. Nothing catches an
override that silently stops _painting_ — the element moves behind a wrapper,
a state stops being reflected, the cascade order shifts. The theme still
compiles, the component still renders, and the theme quietly stops applying.
That failure is only visible in pixels.

## The three outcomes

| status    | meaning                                                         | what to do                              |
| --------- | --------------------------------------------------------------- | --------------------------------------- |
| `pass`    | nothing moved                                                   | ship                                    |
| `changed` | pixels moved somewhere                                          | look at the report and decide, per shot |
| `failed`  | a shot could not be captured, or the baseline is not comparable | fix the gate before trusting it         |

`changed` is a question, not a failure. **"The after is correct" is a valid
answer** — a deliberate restyle _should_ move pixels. Recording that answer is
what `visual-baseline.yml` does, and it writes who decided, when, against which
run, and why, into the baseline's decision log.

## What gets photographed

Both tiers are derived, never hand-listed, so coverage tracks the system:

- **surface** — one story per component in the default theme, light and dark.
  The broad regression net.
- **theme-matrix** — for every component override a theme actually authors, a
  story that _renders that state_. A scout pass loads the candidate stories
  and reads the DOM first, so `badge` in its `warning` variant is photographed
  in a story that has one, rather than assuming the default story covers it.
  On this repo that is the difference between 200 overrides no shot could
  verify and 49.

`--tiers full` widens `surface` to every story in the index (~1,770 shots).

Anything the matrix still cannot reach is named in the report under **theme
overrides that bound to nothing** — either the plan cannot get there, or the
component stopped rendering what the theme aims at. Both are worth knowing.

## Running it locally

```bash
pnpm build && pnpm -F @astryxdesign/storybook build

# what would be captured, and why
node .github/scripts/visual-gate/gate.mjs plan

# capture, compare, write .visual-run/{verdict.json,report/index.html}
node .github/scripts/visual-gate/gate.mjs check \
  --baseline .visual-baseline --out .visual-run

open .visual-run/report/index.html
```

Exit codes are the contract: `0` pass, `1` crashed, `2` changed.

### PR scope follows the release channel

`pr-visual` compares only the stable published visual surface:

- Core component change → every story of that component, light/dark, in every
  shipped theme that styles it.
- Published theme change → that theme's relevant target/story matrix.
- Shared stable theming/token infrastructure → the full plan, which declines
  visibly at the 240-shot review budget and defers to the daily gate.
- A package with `package.json.astryx.canaryOnly: true` → no visual comparison,
  no visual baseline, no capture-only smoke job. It still typechecks, unit-tests,
  builds Storybook, and publishes to canary. Experimental pixels are not a
  stable release decision and should not create a red check people learn to
  ignore.

The daily gate uses the same boundary: `stableStoryPackages` in
`visual-gate.config.json` is currently `["Core"]`, so Lab/canary stories cannot
hold a stable release. Pass `--story-packages '*'` only for an explicit
non-release audit.

`.github/scripts/visual-scope.mjs` owns that classification from package
metadata; workflow YAML does not hard-code today's package names.

`--sample 24` takes an even slice of the plan for a quick smoke test.
`--observations <file>` caches the scout pass between runs.

**A local baseline is for local work only.** Rendering differs by platform and
by browser build, so a baseline captured on a Mac and a capture from an Ubuntu
runner would read as "everything changed". The gate refuses that comparison
instead of showing you 500 false diffs, and the shared baseline is only ever
written by CI, from the pinned runner label.

## Two different questions

The gate asks two things, and only one of them is a screenshot.

**Did anything move?** — the shot tiers, compared against an accepted baseline.
Catches any visual regression, in any theme.

**Did each theming target's override actually reach the pixels?** — `gate.mjs
reach`, and no baseline is involved. A pixel diff cannot answer this: when an
override stops applying, the frame is captured broken and promoted as correct,
and every later run agrees with it forever. The probe theme gives every
selector a unique deterministic colour, so this is an equality test — compute
the colour that selector should have produced, read the element, compare. It
names the target instead of a rectangle, and it cannot flake.

Three outcomes, because the difference matters:

|          | meaning                                                                          |
| -------- | -------------------------------------------------------------------------------- |
| reached  | the override painted                                                             |
| shadowed | another target on the _same element_ won — a fact about the markup, not a defect |
| missed   | nothing probe-coloured won                                                       |

```bash
node .github/scripts/visual-gate/gate.mjs reach
```

It runs in the daily gate and is **reported, not enforced**. Today 50 targets
miss, from one systemic cause: StyleX emits into `@layer priority1-4`, which
sort _after_ `astryx-theme`, so wherever a component sets a property the theme
override loses. Failing the gate on a known systemic issue would only teach
everyone to ignore it — enforce it once that is fixed and the count is zero.

## How the release cut uses it

The daily cut (08:00 PT) reads the gate's verdict before it merges the version
bump:

```
https://facebook.github.io/astryx/visual-gate/latest/release-gate.json
```

| verdict                                             | the cut does                                                                                                                                                                                                                                         |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| visual `pass`, a11y `clean`                         | cut, no comment                                                                                                                                                                                                                                      |
| visual `changed`                                    | open the report and judge every change. Intentional → dispatch **Visual Baseline** with those keys and a reason, then cut, naming the accepted changes in the release note. Not intentional → hold the cut, say what regressed in chat, fix it first |
| a11y `failed` (new violations against the baseline) | hold the cut and fix, or baseline the violation deliberately                                                                                                                                                                                         |
| either `crashed`                                    | hold. A gate that cannot run is not a green gate                                                                                                                                                                                                     |

The one thing that must not happen is a release going out through a diff nobody
looked at — including a "changed" nobody read.

## Accepting a change

From the report, note the shot keys, then dispatch **Visual Baseline** with the
gate run id, the keys (or `all`), and a reason. The promoted PNGs come out of
that run's capture artifact, so the picture that becomes the baseline is
exactly the picture that was reviewed.

**Bootstrapping**: the first gate run has nothing to compare against — it
reports every shot as `added` and passes. Dispatch **Visual Baseline** against
that run with `keys=all` to make it the reference. Do the same after a
deliberate system-wide restyle.

A browser bump moves antialiasing everywhere at once; the gate detects it and
tells you to refresh rather than reporting hundreds of regressions.

## Determinism

Every shot is taken with animations and transitions forced to their end state,
carets hidden, a fixed viewport at device scale 1, fonts awaited, **the clock
frozen at a fixed instant in a fixed timezone**, and **all off-origin requests
blocked** — nothing that renders may depend on a CDN being up.

The frozen clock is why a story built from `new Date()` — Schedule, Calendar,
DateRangeInput — does not report `changed` every day. Shots of those stories
show 13 May 2026, not today; that is the capture's clock, not stale data. The
instant lives in `lib/capture.mjs` and is recorded in every manifest. Changing
it changes those shots, so it is a deliberate rebaseline, not a tweak.

Theme and colour mode are switched over Storybook's own channel rather than
by reloading, which is what keeps 514 shots inside a few minutes;
`--no-fast-globals` forces a reload per shot if a story's state ever turns out
to survive the re-render.

## Where the images live

| what                                        | where                                          | size / retention     |
| ------------------------------------------- | ---------------------------------------------- | -------------------- |
| baseline PNGs                               | `gh-pages:visual-gate/baseline/`               | ~10 MB, permanent    |
| reports (changed shots only)                | `gh-pages:visual-gate/<run_id>/` and `latest/` | last 20 runs, pruned |
| full capture (what a promotion copies from) | Actions artifact `visual-capture`              | 14 days              |

Nothing lands in `main`.

**gh-pages is shared, and it is rebuilt as an orphan commit.** `deploy.yml`
materializes only `storybook`, `sandbox` and `assets`, and carries every other
path forward by SHA — `visual-gate/` survives by that mechanism, exactly as
`pr/` and `reports/` do. **Never add `visual-gate` to that sparse-checkout
set**: paths inside the cone are wiped and republished on every deploy, which
would destroy the baseline and silently disarm the gate. `cleanup-previews.yml`
only removes `pr/<number>/` and legacy 7-hex directories, so it does not touch
it either.

## Files

| file                      | role                                                                     |
| ------------------------- | ------------------------------------------------------------------------ |
| `gate.mjs`                | CLI: `plan`, `capture`, `check`, `accept`                                |
| `lib/plan.mjs`            | which shots exist, and why each one does                                 |
| `lib/capture.mjs`         | Playwright capture and the scout pass                                    |
| `lib/compare.mjs`         | pixel comparison, targeting analysis, the verdict                        |
| `lib/report.mjs`          | the before / after / diff report                                         |
| `lib/baseline.mjs`        | the baseline store and the one operation that writes it                  |
| `lib/sources.mjs`         | theming targets and theme overrides, from the product's own enumerations |
| `visual-gate.config.json` | viewport, tolerances, and story exclusions with reasons                  |
