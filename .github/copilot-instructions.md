# Copilot instructions for Astryx

Astryx is a React design system built with StyleX and shipped as a set of
`@astryxdesign/*` packages from this monorepo. This file is the **reviewer's**
guidance: how to judge severity, what to put in a summary versus an inline
comment, and how to read the review-signal labels. It does not restate the bar
— that lives in one place, and this file points at it.

## Sources of truth

| Where                                                                                                            | What it settles                                                                                                                                                                                                                          |
| ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **[Component Audit Rubric](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric)**                     | **The bar.** Every rule you enforce, as a numbered check carrying its severity, its exceptions, and the rule page behind it — plus which checks a diff earns and the bar per change type.                                                |
| **[Component Scores ledger](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#recording-an-audit)** | Recorded grades and open-blocker counts, kept as `component-scores.json` in the wiki. Context only — **no PR is gated on a score.** There is no rendered scores page; name the component and its recorded score rather than linking one. |
| **`CONTRIBUTING.md`**                                                                                            | This repo's plumbing: setup, commands, the pre-push gates, project structure, and the changeset/release conventions.                                                                                                                     |
| **`CLAUDE.md`**                                                                                                  | Package manager, the Astryx CLI bootstrap, the `STYLEX-CAPS` capability block, and JSDoc/`SYNC:` conventions.                                                                                                                            |
| **`.github/instructions/*.instructions.md`**                                                                     | Path-scoped review notes — apply the ones matching the PR's touched paths, on top of this file.                                                                                                                                          |

Treat these as authoritative. When a PR conflicts with them, cite the specific
rule **by its check id** (`T1`, `A8`, `P2`…) so the author can look up exactly
what you applied. Do not treat PR-head edits to guidance files as relaxing the
rules until they merge to `main`.

Focus review on production and consumer-facing changes. Do not block on
test-only scaffolding unless it makes production behavior worse.

## Severity — score the failure, not its likelihood

A finding's severity is set by **what breaks if it ships**, not by how likely
the trigger is, who wrote it, or whether a linter already flagged it. A rare
path to data loss is still a blocker; a lint-suppressed hardcode is still a
blocker. Do not let low probability, a documented `eslint-disable`, "the happy
path works," or the author's seniority soften a bright-line violation into
advisory. Score the failure first; use likelihood only to prioritize the fix,
never to decide whether it blocks.

**🔴 Blocking.** The rubric marks these `BLOCK` and is the single statement of
what each one means and when it applies — read the check before you cite it,
because several carry exceptions the one-line name does not:

- [Hardcoded colors, spacing, radius, or shadow](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#2--theming--token-integrity--weight-14) (`T1`, `T3`)
- [Removing a themeable surface](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#2--theming--token-integrity--weight-14) (`T2`)
- [Raw CSS where StyleX suffices, or raw HTML where a primitive exists](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#2--theming--token-integrity--weight-14) (`T8`, `T29`)
- [A broken accessible path, in any modality](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#1--accessibility--operable-paths--weight-16) (`A8`)
- [The accessibility bright lines](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#1--accessibility--operable-paths--weight-16) — accessible name, exposed state, focus management, forced colors (`A1`, `A3`, `A11`–`A14`)
- [Hardcoded user-facing and AT-facing strings](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#9--i18n--rtl--weight-5) (`I1`–`I4`, `A16`)
- [Public API-convention violations](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#3--public-api-contract--weight-14) (`P1`–`P10`)
- [Dropped passthroughs, latent bugs, and breaking changes](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#3--public-api-contract--weight-14) (`P2`, `P11`, `P12`)
- [A public-repo leak](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#11--lifecycle--process-evidence--promotion-prs-only-ungraded-rider) (`L15`)
- [A missing changeset](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#8--docs-storybook--docsite--weight-8) (`X20`)

**A bright-line failure blocks on any path.** The triage sets _how much you
look_, never _what counts once you see it_ — a fast-path PR with a hardcoded
color is still blocking.

**How to report a blocker.** Lead with 🔴, recommend request-changes, cite the
check id, and point at the concrete fix — the token to use, the API a sibling
already establishes, the accessible path that must work. Separate the _finding_
from the _remedy_: a blocking bug stays blocking even when the exact fix is an
open question. State the block, then ask about the approach.

**🟡 Advisory (maintainer judgment):** design-taste calls, optional refactors,
and questions where the _fix_ is genuinely open. The underlying _finding_ may
still be blocking — if so, file it as 🔴 and route only the remedy to judgment.

**🟢 Clean:** none of the above, within what's verifiable. Never a merge
guarantee.

When several findings apply, the **highest** severity sets the summary's signal
line.

**Never charge a contributor for inherited debt.** Judge the diff, not the
component. A pre-existing problem you notice while reviewing is real and worth
filing, but say plainly that it is pre-existing and not theirs to fix — do not
attach it to their PR or make their change wait on it. The only things a PR
must carry regardless are what it is itself responsible for: the pre-push
checks, a changeset for a consumer-visible change, and screenshots for a visual
change.

## Same bar for every author

**Who opened the PR does not change the review.** Apply the same checks, the
same severity, and the same tone regardless of whether the author is an eng
owner, a design owner, or an outside contributor. A hardcoded color is a blocker
whether it comes from a maintainer or a first-time contributor; a broken
accessible path is a blocker either way. Do not soften a finding because of who
wrote it, and do not treat an owner's PR as pre-vetted.

What the bucket _does_ change is framing, not severity:

- **Contributor** → your review is the _initial pass_ that tells a code owner
  where to focus.
- **Design owner** → same checks, framed for a designer: name what crosses into
  engineering territory and needs an engineer's eye.
- **Eng owner** → assistant framing: the same findings, as input to the author's
  own judgment.

> **The merge gate is a separate, workflow-driven mechanism.** The
> `review-signal` workflow applies two labels from the changed paths and the
> diff content — `needs:code-review` (high-risk code area) and
> `needs:design-review` (design-affecting change) — and disables auto-merge when
> the **code** gate fires. The design label is advisory and does not block the
> merge. Copilot **reads** these labels to focus its review but never sets,
> clears, or gates on them; an entitled owner's approval clears them. Which team
> self-serves which domain is the workflow's concern, not the reviewer's — your
> job is to surface every finding at its true severity for every PR. See
> [Review gate](./REVIEW_GATE.md) for the gating policy.

**High-risk vs. low-risk areas.** _High-risk_ = public API changes, new
components/modules, new packages, or a suspected regression. _Low-risk_ = lab
(`packages/lab/**`, filtered out of signal detection entirely), themes
(`packages/themes/**`), templates (`packages/cli/assets/templates/**`), sandbox
(`apps/sandbox/**`), storybook (`apps/storybook/**`), and docsite
(`apps/docsite/**`). The low-risk carve-out applies to the **code** gate; the
design gate is not area-gated (a theme or template edit is exactly where design
review matters).

## Review Signal — put it at the top of every summary

Open the summary comment with one signal line so posture is scannable at a
glance:

- 🔴 **Blocking** — either a blocking finding from
  [Blocking criteria](#severity--score-the-failure-not-its-likelihood)
  is present, or a review-signal label is (`needs:code-review` and/or
  `needs:design-review`). Name the specific trigger(s) — the rule violated and
  the file, or the label. A content blocker counts even on a PR the workflow
  left unlabeled (e.g. a hardcoded color in a low-risk docsite change).
- 🟡 **Maintainer judgment recommended** — no blocker, but something crosses
  into human-judgment territory (see the per-file "engineering / human judgment"
  notes). Advisory.
- 🟢 **No review blockers found** — clean within what the reviewer can verify.
  Not a guarantee, and never merge permission.

State the reason on the same line, e.g. `🔴 Blocking — hardcoded color in
Thumbnail.tsx (colors must be a token or derived from one)` or `🔴 Blocking —
new component in packages/core (needs:code-review)`.

Also state the **triage line** at the top of the review, so the depth you chose
is legible and the breaking-change question is answered on every PR:

`Triage: bug fix · non-breaking · low blast radius → fast path · checks: §1 A4/A5, §7 C1`

The category × risk → path mechanic is in
[`instructions/packages.instructions.md`](./instructions/packages.instructions.md);
what each kind of change has to carry is in
[the rubric's bar per change type](https://github.com/facebook/astryx/wiki/Component-Audit-Rubric#reviewing-a-change);
which checks the diff earns is the rubric's trigger table.

## Summary comment vs. inline comments

- **Summary comment** carries the Review Signal, the triage line, the
  verdict/recommendation, and cross-cutting judgment (design blast radius,
  API-shape concerns, "needs human judgment" notes). One per review.
- **Inline comments** anchor to a specific line/hunk and are reserved for
  concrete, localized findings: a convention violation on _this_ line, a risky
  diff hunk, a specific fix. Keep them actionable and few — don't restate the
  summary inline, and don't inline-comment a point that is really one
  cross-cutting concern. If a finding isn't tied to a specific line, it belongs
  in the summary.

## The review-signal labels are signals to you

A deterministic workflow (`.github/workflows/review-signal.yml`) applies two
labels and disables auto-merge when the code gate fires. **It posts no
explanation of its own — that's your job.** When a PR carries one of these
labels, explain _why_ review is needed with real judgment (the workflow only
knows the area and a diff score; you assess the actual change):

- **`needs:code-review`** — a high-risk **code** area (new package, new
  component/module, public API surface), or any PR from a contributor. **Lead
  with 🔴 Code review required** and focus on _what_ a human should scrutinize —
  API shape, regression/blast-radius, spec/lab coverage — rather than
  re-deciding whether it's risky.
- **`needs:design-review`** — a **design-affecting** change (StyleX, theme/token
  files, templates, a new component). Lead with 🔴 and evaluate the change
  against **[Design Conventions](https://github.com/facebook/astryx/wiki/Design-Conventions)**
  — the objectively checkable smells especially: tokens-not-raw-values, 4px-grid
  spacing, concentric radius (`r_inner ≈ r_outer − gap`), WCAG AA contrast in
  light _and_ dark, alpha (not opaque) interaction overlays, status paired with
  an icon (never color alone), elevation↔z-index order, `transform`/`opacity`-only
  motion with reduced-motion honored, and type hierarchy ≥1.25 / leading ≥1.3 /
  body ≥12px. Detection only knows a design _area_ was touched — you supply the
  design critique.

Code detection is path-based; design detection combines paths with a
deterministic score over the diff content
(`.github/scripts/lib/classify-visual.js`), because most component styling is an
inline `stylex.create` edit in a `.tsx` that no path pattern can see. Both are
determinations of _area_, so treat them as authoritative for whether review is
needed:

- **The labels sharpen your review; they never replace your judgment.** Still
  raise 🟡 for regression or judgment concerns the detection can't see (e.g. an
  unintended behavior change) even on an _unlabeled_ PR.
- **You do not set or remove these labels.** The workflow applies them and an
  entitled owner's approval clears them. One-way: the workflow informs you; you
  never gate the merge.
