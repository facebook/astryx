# Storybook visual regression

Every visual-regression test uses the shared Storybook framework and
`.github/workflows/ci.yml` → `pr-visual` (**Stable visual regression**).
[AST-030 FR12](../../../docs/specs/AST-030/spec.md) owns this requirement.
Add coverage to that owner, not to a new component, package, theme, scheduled,
post-CI, or post-merge workflow.

## Explicit release checks

Dispatch **CI** from `main` with `operation=release-check`. The event SHA is
immutable for the run; the request and final `release-check` join reject a
non-main ref or a SHA that is no longer current main. After main advances, dispatch
again rather than reusing an earlier green run.

The existing Storybook build feeds the same **Stable visual regression**
(`pr-visual`), `pr-a11y`, and `pr-rtl` owners. Release scope is the closed full
stable visual plan, unfiltered accessibility roster, and all five unfiltered RTL
package shards. No changed-file, focused-component, or smoke scope applies.
`release-check` requires every owner and setup job to succeed; failed, missing,
cancelled, and skipped work is not release evidence.

This changes when and where release evidence runs, not finding policy: visual
`changed` still requires review, a11y fails on new baseline violations, and RTL
findings remain soft while report completeness is mandatory. The dispatch does
not capture baseline candidates, promote baselines, publish previews, or replace
PR checks. It runs only on request, not every push. `visual-release-report` holds
the visual evidence for that exact run/attempt.

PR accessibility is intentionally smaller: explicit changed-component axe scope
(including grouped-folder owners), plus the fast modal-close, theme-var, and
story-play guards. Empty/shared scope never falls back to all stories, and
missing or approximate analysis fails rather than granting an empty scope.
The full axe roster, whole-repository accessibility spec-test contracts and their
pixel/evidence uploads, and Probe reach sweep run only during `release-check`.

Release callers must bind the CI run/attempt and all three job outcomes to its
exact main SHA, and recheck main immediately before release mutation. The public
[Release Process](https://github.com/facebook/astryx/wiki/Release-Process) needs a
separate follow-up to replace constituent-PR-only gating with this dispatch; this
CI capability does not update release automation.

## Coverage and results

Stable Core components use representative stories and explicitly tagged stories.
Shipped theme changes use their relevant accepted matrix. Shared stable scope
uses the full canonical plan in the same CI owner, rather than delegating to a
daily workflow. Packages with `astryx.canaryOnly: true` have no stable visual
baseline; their existing unit, Storybook, accessibility, and RTL checks remain.

Story tags declare additional coverage next to the example:

```tsx
export const CustomSeparator: Story = {
  tags: ['visual-baseline'],
  render: () => /* ... */,
};
```

The representative story needs no tag. `visual-baseline` adds a default-theme
contract; `visual-theme-matrix` opts the story into every accepted theme.
Behavioral/audit-only fixtures need no visual tag. `no-visual` excludes unstable
stories. Ordinary focused PR plans use existing baseline keys; adding or pruning
keys requires explicit full-plan baseline maintenance.

- `pass`: the compared frames did not change.
- `changed`: review the before/after/diff report and record whether the rendering
  is intentional. A change is not automatically a regression.
- `failed`: capture or comparison failed. Missing evidence is not passing evidence.
- `skipped`: no comparison was performed; the reason is explicit. It does not
  imply a separate workflow covered the change.

The `visual-pr-report` artifact belongs to the exact CI run and attempt.
`pr-comment.yml` only publishes its report: it checks identity, bounds JSON and
image sizes, re-encodes PNGs, and renders escaped HTML from default-branch code.
It does not execute artifact HTML, run a browser, compare pixels again, change
a baseline, or create another visual status.

Deployment previews, `a11y-weekly.yml`, `rtl-weekly.yml`, and
`vibe-screenshots.yml` remain separate because they do not run visual regression.
The baseline-free `gate.mjs reach` diagnostic lives with the existing `pr-a11y`
browser checks; it tests whether Probe overrides reach their targets, not whether
screenshots match a golden image.

## Explicit baseline maintenance

Maintenance uses **CI**, not another workflow. Dispatch from `main`:

1. Choose `operation=capture`. The same `pr-visual` owner builds Storybook on the
   pinned Linux runner and captures the full canonical plan: representative and
   tagged Core stories in Neutral plus generated Probe coverage.
2. Review that run's report and capture. A browser-version mismatch can make the
   comparison fail while still producing a complete candidate capture; inspect
   the rendering rather than accepting it merely to clear a check.
3. Dispatch CI again with `operation=promote`, the reviewed `run_id` and
   `run_attempt`, selected `keys` (or `all`), and an explicit `reason`. Choose
   `prune` only when the full-plan removal checks permit it.

Promotion verifies the source maintenance run, attempt, and artifact identity,
then uses the shared serialized gh-pages publisher. It never recaptures or
promotes automatically after merge. The existing accept/prune validation and
decision log remain the write boundary. Partial captures cannot become complete
baseline candidates. Bootstrap, coverage changes, and browser refreshes use this
same path; none is a release gate.

The shared promotion boundary accepts `pass` or `changed`. A failed comparison
is eligible only for the validated browser-only refresh: every baseline and
captured key is selected, platform and viewport match, every PNG matches its
manifest hash, and there are no capture failures or removals. Missing, unreadable,
skipped, unknown, partial, or otherwise failed evidence is refused before writes.

## Local debugging

```bash
pnpm build && pnpm -F @astryxdesign/storybook build
pnpm visual:plan
pnpm visual:check --baseline .visual-baseline --out .visual-run
open .visual-run/report/index.html
```

CLI exit codes: `0` clean, `1` crashed, `2` changed. `gate.mjs release` selects the
closed full canonical plan used by broad PRs, release checks, and maintenance.
`gate.mjs accept` is an explicit local write; CI baseline publication uses it
inside the serialized publication turn. Local baselines must stay local:
platform and browser differences make them incomparable with the pinned CI
baseline.

## Determinism and storage

Capture fixes the viewport, scale, clock, timezone, fonts, and animation end
state, and blocks off-origin requests. Storybook's channel selects theme and
color mode. Each story starts in the default light theme before switching
variants. Canonical PNG encoding avoids treating encoding metadata as pixels.

The baseline remains at `gh-pages:visual-gate/baseline/`. Immutable PR reports
remain beside the preview at `pr/<number>/visual/<head>/<run>/<attempt>/`.
The shared publisher, deployment, cleanup, and compaction must preserve the
baseline and publication queue. Do not delete the `visual-gate/` subtree when
retiring workflows; it still contains live baseline data and queue state.

## Drift guard

`pnpm check:visual-owner` runs inside `pnpm check:repo` and the existing lint lane.
It rejects independent visual-regression commands, known visual runners,
package-script aliases, named visual-regression jobs, and visual artifact
producers outside `ci.yml`'s owner. It deliberately permits report-only downloads,
Storybook deployment artifacts, accessibility/RTL reports, and vibe screenshots.
This is a narrow ownership tripwire, not a shell interpreter or a blanket ban on
Playwright, screenshots, or artifact actions.
