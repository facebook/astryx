# readme-r1 — candidate notes (W1, recommendation R1)

Candidate README that implements **R1: make `npx astryx init` the path of least
resistance.** Overlay for the published `@astryxdesign/core` tarball in the
fresh-install A/B. Baseline = the current `packages/core/README.md`.

## Hypothesis (one sentence)

Making `npx astryx init` the single, unmissable step-1 and collapsing the
full copy-paste framework walkthroughs into a subordinate "Manual setup (advanced)"
fallback removes the complete no-init escape hatch, so an agent skimming top-down
runs `init` (getting the `<!-- ASTRYX:START -->` cheat sheet) instead of hand-wiring
a working app without it — raising the init-ran rate.

## Changelog vs. current README

**Promoted / added**

- Added a **top-of-file one-command blockquote** (`Setup is one command:
  npx astryx init`) so the first thing any reader/agent sees is init.
- Added a dedicated **`## Setup`** section as the *first* section. It leads with
  install → `npx astryx init` (step 1, "do this first"), states in one place what
  init does (installs the AGENTS.md/CLAUDE.md cheat sheet; optional theme/template;
  prints the styles + provider steps), and has a prominent AI-agent callout.
- Documented the **non-interactive / agent forms**: `npx astryx init --features agents`
  and `npx astryx init --all`, with a note that bare `init` needs a TTY.
- Reordered the **Astryx CLI** command list so `npx astryx init` is the first entry
  ("start here"). Added "run init first" reminders to the CLI and Page Layouts intros.

**Demoted**

- The four previously top-level Quick Start subsections (Next.js, Next.js+Tailwind,
  Next.js+StyleX, Vite) are now **collapsed under a single `## Manual setup
  (advanced)`** section, each inside a `<details>` block, placed *after* Setup,
  Component Docs, CLI, and Page Layouts.
- The primary flow **no longer reproduces `globals.css` / `providers.tsx` /
  `layout.tsx` inline.** Setup points to Manual setup for the exact code and notes
  init prints these steps. This is the core R1 move: no self-sufficient copy-paste
  path competing with init.
- Manual setup opens with "prefer the CLI; init does all of this + the cheat sheet"
  and **ends with** "…or just run `npx astryx init`" (per R1).

**Kept intact (genuinely useful reference)**

- Component Docs (`docs.mjs`), full CLI command reference, Page Layouts/templates,
  the Tailwind token-bridge table, CDN (UMD + esm.sh) with the version-pin caveat,
  Related Packages, Resources.

## Deviations from the task prompt / things I was unsure about

- **`--yes` is not a real flag.** The task suggested `npx astryx init --yes --features
  agents`, but `packages/cli/src/commands/init.mjs` only defines `--features`,
  `--all`, `--remove-agents`, `--agent`, `--agent-docs-path`, and the program sets no
  `allowUnknownOption()` — so `--yes` would be a Commander parse error and could push
  the agent *back* to manual setup. I documented the verified non-interactive forms
  (`--features agents`, `--all`) instead. If the harness greps specifically for
  `--yes`, revisit.
- **init does not auto-write your CSS/providers.** It installs the agent cheat sheet,
  optionally scaffolds a theme/template (interactively), and *prints* the base-style
  + provider steps (`getNextSteps()`); it does not silently edit `globals.css` /
  create `providers.tsx`. I described it as "walks you through / prints" rather than
  "auto-wires" to keep the README honest. If the team wants true auto-wiring, that's a
  CLI change beyond this README.
- **Manual "if you're not using the CLI" framing.** Because init only *prints* the
  wiring, init users still need the code in Manual setup. The subtitle clarifies this
  ("the exact code init prints") so it stays subordinate to init without implying init
  fully auto-wires.
- **`npx astryx` resolution.** Kept the existing repo convention (`npx astryx …`);
  it requires the `astryx` bin (installed `@astryxdesign/cli` or npx fetch). The
  harness already exercises this (trace01 ran `astryx init --all`). Added an explicit
  "install -D @astryxdesign/cli" note to keep the happy path unblocked.
- **Scope: R1 only.** Deliberately did **not** embed the `<!-- ASTRYX:START -->`
  cheat-sheet block in the README — that's R2, and mixing it in would confound the A/B
  measuring R1's isolated effect.
- **Anchor links.** Used a simple `## Manual setup (advanced)` heading so the
  `#manual-setup-advanced` slug is stable across GitHub/npm rendering.

## Untouched

- Did **not** modify `packages/core/README.md` (the baseline) or any other repo file.
- Did **not** start/stop any process or experiment. Output is confined to
  `internal/vibe-tests/fresh-install-test/candidates/readme-r1/`.
