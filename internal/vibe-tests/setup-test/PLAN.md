# Setup test — getting the system into an app that already has one

**Status:** harness + a mechanism-verification run. **No agent has run it yet** —
no agent findings, no scores, no recommendation. The numbers below come from
applying our own documented recipes with no agent in the loop, which is what
makes the harness trustworthy before it is pointed at agents (same order as
`cli-discovery-test`).

## The gap

Every arm we run today — the nightly evaluation, and the adoption test in
`../adoption-test` — hands the agent a project where the design system is
**already correctly wired**. The nightly's `project-astryx-tailwind` environment
ships a `globals.css` with the layer order already declared and every import in
the right place. The adoption test installs the system in _every_ condition on
purpose, because there the variable is whether the agent reaches for it.

So nothing we run measures **the install**: the twenty minutes between "we're
going to use Astryx" and "the app renders correctly with Astryx in it", in an app
that already has a styling system, a token vocabulary, house components and a
year of CSS.

That gap matters more than it sounds, because of what a bad install looks like.

## What a bad install looks like

It looks like a good one. Measured on the fixture, applying the recipe our own
README prints:

|                            |                  |
| -------------------------- | ---------------- |
| `tsc --noEmit`             | clean            |
| `vite build`               | clean            |
| console errors             | 0                |
| page errors                | 0                |
| failed requests            | 0                |
| contrast on the page title | **15.79 → 1.10** |

Nothing in the toolchain says a word. The only signal is that the page is wrong,
which is exactly the signal an agent doesn't have, CI doesn't have, and a
reviewer reading a diff doesn't have either. A greenfield test cannot produce
this finding: there is no "before" for the app to be measured against.

## What this test measures

The system under test is **not the components** — it is the **setup surface**:
the recipes in `packages/core/README.md`, in `astryx docs styling-libraries`, and
whatever `astryx init` writes. The outcome is the **rendered app, measured
against itself before the install**.

|             | Nightly evaluation        | Adoption test                   | This test                        |
| ----------- | ------------------------- | ------------------------------- | -------------------------------- |
| Environment | empty scaffold per target | one fixed app, system installed | one fixed app, system **absent** |
| Variable    | the design system         | the guidance surface            | the guidance surface             |
| The task    | build a thing             | build a feature                 | **install the system**           |
| Output      | one `.tsx` file           | a working-tree diff             | a **built, rendered page**       |
| "Correct"   | valid component usage     | did it adopt, and does it fit   | is the app still the app         |

Because the output is a rendered page, the fixture app is a real Vite + React +
Tailwind v4 build that compiles and renders before any run starts. That is the
one structural difference from the adoption fixture, which is scored from a diff
and never runs. Everything else — the components, the house conventions, the
canonical status mapping, `AGENTS.md` — is the same app, and the two fixtures
should converge to one copy once both tests land.

## The arms (`conditions.json`)

The system is installed in **no** condition; installing it is the task.

- **`s0-docs`** (floor) — public docs only. What a consumer gets today.
- **`s1-pointer`** — `AGENTS.md` points at the CLI. Isolates _discovery_: if this
  arm moves the score, agents were failing to find the docs; if it doesn't, the
  docs themselves are the problem.
- **`s2-existing-app`** — a candidate existing-app recipe exists
  (`guidance/existing-app.md`). This is the arm that decides whether a doc change
  ships.
- **`s3-directed`** (ceiling) — handed the exact edits. Measures the **residue**:
  what an install costs even when nobody makes a mistake. Residue the ceiling
  cannot remove is a product finding, filed against the packages.

## The measures (`setup-eval.ts`)

All deltas against the pristine app, computed by the same code for every arm,
with the analyzer blind to the condition id (Checker Protocol §1).

1. **Builds** — `tsc` + bundler. Gate, not a score.
2. **Console/page/request errors** — a silent page proves nothing on its own, but
   a noisy one is a different, easier failure and should not be scored the same.
3. **App regressions** — every computed property that moved on a piece of the
   app's chrome the task never mentioned, bucketed into typography / color /
   geometry / spacing. A probe the install _removed_ is reported as missing
   rather than skipped.
4. **Legibility** — text that was above WCAG AA (4.5:1) before the install and is
   below it after. This is the severity axis, and it is not optional: two arms in
   the run below produced the **same regression count** while one of them was
   unreadable.
5. **Mode dependence** — probes that render differently under
   `prefers-color-scheme: light` and `dark` in the arm, but did not in the app
   before. This is "works on my machine", made into a number.
6. **Variable capture** — root custom properties whose resolved value the install
   changed, or emptied. The app's own vocabulary, taken over by name.

Verdicts: `broken-build`, `noisy`, **`silent-damage`**, `cosmetic-drift`, `clean`.
`silent-damage` is the outcome this test exists to name.

## Mechanism-verification run

Three recipes (`apply-recipe.mjs`), applied to the fixture by script, no agent:

- **`docs-verbatim`** — `packages/core/README.md` § _Next.js + Tailwind_ and
  `astryx docs styling-libraries` § _Tailwind_, transcribed. Both print the same
  block, and both write it as the whole file, so the app's own
  `@import 'tailwindcss'` is replaced.
- **`docs-no-bridge`** — the same, minus `tailwind-theme.css`. Not documented
  anywhere; included to separate the bridge's damage from the rest.
- **`layered-in-place`** — the candidate: keep the app's Tailwind entry, declare
  the layer order, three system sheets, `mode="dark"` on the provider.

`--scheme light` (a light-mode machine, and every headless CI):

| arm                | builds | console | app regressions                              | unreadable | mode-dependent | vars captured | verdict           |
| ------------------ | ------ | ------- | -------------------------------------------- | ---------- | -------------- | ------------- | ----------------- |
| `docs-verbatim`    | yes    | 0       | **30** (typo 22, color 4, geom 1, spacing 3) | **3**      | 3              | 5             | **silent-damage** |
| `docs-no-bridge`   | yes    | 0       | 11 (typo 7, color 4)                         | **3**      | 3              | 2             | **silent-damage** |
| `layered-in-place` | yes    | 0       | 11 (typo 7, color 4)                         | 0          | 0              | 2             | cosmetic-drift    |

`--scheme dark` (a dark-mode laptop), same three sandboxes:

| arm                | unreadable | verdict        |
| ------------------ | ---------- | -------------- |
| `docs-verbatim`    | **0**      | cosmetic-drift |
| `docs-no-bridge`   | **0**      | cosmetic-drift |
| `layered-in-place` | 0          | cosmetic-drift |

Three things fall out of that, and each is a separable cause:

**1. The recipe is written for an empty file.** Every documented Tailwind recipe
replaces `globals.css` wholesale: Tailwind imported in three pieces so the system
can sit between them. An existing app's file is not empty — it has that import,
its own `@theme inline` mapping, and its `:root` vocabulary. Nothing in the docs
says what becomes of any of them. Transcribed literally, `--spacing`, `--text-xs`
and `--font-sans` stop resolving at `:root` (an app reading them directly gets
nothing), and the type scale moves under every existing utility: `text-xs` in
this console goes 12px → 10px, across every table, badge and button.

**2. The Tailwind bridge is a rename of names the app already uses.**
`tailwind-theme.css` declares `--color-card`, `--color-muted`, `--color-border`,
`--color-accent`, `--color-primary`, `--color-secondary`, the whole `--radius-*`
and `--shadow-*` ladders, the `--text-*` scale and the base `--spacing` unit —
**13 exact collisions with the default shadcn/Tailwind vocabulary**, and one line
of CSS re-points all of them app-wide. In a new app that is the feature. In this
one it is 19 of the 30 regressions above. It is imported unconditionally in the
README, in `astryx docs styling-libraries`, and in our own
`environments/project-astryx-tailwind` — and the one production app we know that
made this work (agentcloud) has a six-line comment in its `globals.css`
explaining why it deliberately does not import it.

**3. `<Theme>` is a color boundary, and it follows the OS.** The provider paints
`color: light-dark(#171717, #fafafa)` on its wrapper. An app whose dark look is
its own CSS variables has no `data-theme` for the system to read, so `light-dark`
resolves _light_ and every inherited piece of text below the provider turns near
black on a near black surface — contrast 15.79 → **1.10**. `<Theme>` takes a
`mode` prop that fixes it in one word; no setup path mentions it. And because the
default is `system`, the same install is fine on a dark-mode laptop and
unreadable in CI, which is why both schemes are measured.

The candidate recipe removes the legibility failure and the mode dependence
entirely and cuts the regressions from 30 to 11. What it cannot remove is the
**residue**: 11 properties still move, all of them typography (the theme's font
family) and inherited color. That is the number the ceiling arm exists to expose,
and it is a product question, not a docs question — there is currently no way to
adopt the system's components without adopting its type ramp for everything under
the provider.

## Pre-registered decision rule

Set before any agent runs, so results cannot be read backwards.

- A guidance change ships if, against the floor, it **eliminates legibility
  failures** and **halves app regressions**, with non-overlapping CIs across reps,
  and does not increase console errors or break the build.
- **Regression count alone never justifies shipping.** It is a drift measure; the
  legibility and mode-dependence measures are the severity ones. An arm that
  lowers the count while keeping one unreadable probe has not improved.
- Damage the **ceiling** arm still produces is a **product finding**, filed
  against the packages — not evidence that guidance needs more words.
- If `s1-pointer` alone closes most of the gap, the finding is discovery and the
  fix belongs in `astryx init`, not in prose.

## Known limits

- **One fixture.** Findings generalize to "dense console with an existing
  utility-CSS vocabulary and a dark surface", not to all apps. A light-surface
  fixture would not produce finding 3 at all, which is the point of stating it.
- **Probes are selectors.** A probe that the agent's own edit legitimately moves
  is recorded as a regression. That is deliberate for a setup task, where nothing
  in the prompt asks for the app's chrome to change, but it would need revisiting
  before reusing these probes for a feature task.
- **The install line is only partly under test.** Sandboxes share one prepared
  `node_modules` for the app's own dependencies; the agent still runs the real
  install for the system's packages. Registry and peer-dependency friction is
  therefore measured, install-time flakiness is not.
- **Runtime a11y is deferred, not faked** (#4145). Contrast here is computed from
  the two colors actually painted, which is a narrow, honest subset.

## Next step

A pilot: floor vs ceiling on `s1`, K=3, one agent — enough to answer "do the arms
separate at all" before anyone pays for the full grid. Not run yet.
