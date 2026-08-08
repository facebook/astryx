# Review gate

How pull requests are gated for review in this repo. The goal: **let the team
move fast in their own domain, require review where risk or unfamiliarity
warrants it, and keep the PR queue readable** (a PR awaiting review shows a
neutral yellow "waiting" signal, not a red failure).

## TL;DR

| Author | High-risk code | Design-affecting change | Everything else |
| --- | --- | --- | --- |
| **Eng owner** (`ENGOWNERS`) | self-serve | advisory label only | self-serve |
| **Design owner** (`DESIGNOWNERS`) | needs code review | self-serve | self-serve |
| **Contributor** (anyone else) | needs code review | needs code review + design label | needs code review |
| **Bot** (Dependabot, etc.) | exempt | exempt | exempt |

- **Code review is the only hard gate.** It shows up as the `review-required`
  status: `pending` (🟡, blocks the merge) or `success` (🟢).
- **Design review is advisory** — it labels the PR and requests design owners,
  but does not block the merge.
- An entitled owner's **approval clears the gate automatically** (no manual step).

## Sources of truth

| File | Meaning |
| --- | --- |
| `.github/ENGOWNERS` | Engineering team. Self-serve **code**. |
| `.github/DESIGNOWNERS` | Design team. Self-serve **design**. Checked first. |
| `.github/CODEOWNERS` (`*` line) | Who can **clear** the code gate (and native review requirement). |
| `.github/copilot-instructions.md` + `instructions/*` | Copilot reviewer guidance (advisory). |

Author bucket is resolved in order: **design owner → eng owner → contributor.**
A handle in `DESIGNOWNERS` is treated as a design owner even if also an eng
owner. Anyone in neither file is a contributor (and gets a quiet `community`
label so the contribution queue is filterable).

## What counts as high-risk / design-affecting

Detection is **path-based and deterministic** (no LLM in the enforcement path).
`packages/lab/**` is filtered out entirely first — lab is canary staging, so
new components there are expected and never gate.

**High-risk code** (drives the code gate):
- a new package (`packages/<name>/package.json` added)
- a new component/module in a published `src/` (not lab)
- a runtime change under `packages/core/src/**` (incl. styling `.tsx`; excludes
  tests/docs/stories) — core has high blast radius
- a public API surface change (a `src/**/index.ts(x)` barrel or a
  `package.json`)
- **plus:** *any* PR from a contributor (see policy note below)

**Design-affecting** (drives the advisory design label):
- StyleX styling, theme/token files, template `.tsx`, docsite visual dirs
  (`app`/`components`/`themes`)

**Safe spaces** (never gate): `sandbox`, `storybook`, `lab`.
**Design spaces** (advisory, not blocking): `themes`, `templates`, `docsite`.

## Policy note — contributors

All contributor (non-owner) PRs require code review, not just high-risk ones.
External contributors can't self-merge anyway; this mainly ensures a human on
internal contributors' PRs. Owners still self-serve their own domain.

## The mechanism (two workflows)

```
① PR opened / updated  ──pull_request_target──►  review-signal.yml : flag
     bot? → status success, exempt, stop
     resolve author bucket (DESIGNOWNERS → ENGOWNERS → contributor)
     detect high-risk / design from changed paths (lab filtered out)
     read reviews → codeApproved / designApproved
     effective gate = detected/contributor gate AND NOT owner AND NOT approved
       → labels: needs:code-review · needs:design-review (advisory) · community
       → request reviewers: CODEOWNERS (code) · DESIGNOWNERS (design)
       → if code-gated: disable auto-merge
       → set commit status "review-required": pending 🟡 (blocks) | success 🟢
       → neutralize any stale action_required "review-required" check run

② approval  ──pull_request_review──►  review-signal runs a tiny "anchor" job
     so the workflow COMPLETES, which fires:
   ┌─────────────────────────────────────────────┐
   │ review-clear.yml  (workflow_run, base token) │  ← works for fork PRs
   └─────────────────────────────────────────────┘
     resolve the PR by the run's head_branch (head_sha points at main here)
     entitled CODEOWNER approved?
       → drop needs:code-review · status → success 🟢 · neutralize stale check

③ every 15 min  ──schedule──►  review-clear.yml sweep (same clearOne)
     open PRs whose gate is unresolved (label OR pending status)
     entitled owner already approved? → clear it
     ⇒ a clear lost to a transient failure heals itself; never creates a gate

④ branch protection on main
     required status context "review-required": pending blocks, success allows
     + 1 required approving review (native)
     ⇒ blocks non-admin merges even for write-access internal contributors
```

## Enforcement

`review-required` is a **required status check** on `main`, plus the native
"1 approving review" requirement. Because a required check blocks non-admin
merges regardless of write access, this holds internal contributors who have
write but are not owners. (Repo admins can still bypass.)

## Why a commit status (not a check run)

The gate is a **commit status**, not a check run, for two reasons:
1. Branch protection requires `review-required` as a **status context**
   ("Expected — waiting for status to be reported"); a check run of the same
   name does not satisfy it.
2. A `pending` status renders as a neutral **yellow** dot ("waiting"), not a red
   failure — so a PR awaiting review does not add red noise to the queue.

PRs gated before this switch may carry a stale `action_required` **check run**;
both workflows neutralize it (a leftover would otherwise drag the status rollup
to failure).

## Recovery / manual re-flag

**Normally you don't need this — the gate self-heals.** `review-clear.yml` runs a
clear-only sweep every 15 minutes: any open PR still carrying an unresolved code
gate (the label, or a pending `review-required` status) is re-checked, and
cleared if an entitled owner has already approved. So a clear that is lost to a
transient failure — a workflow that dies in "Set up job" during a GitHub Actions
incident, a dropped webhook, a cancelled or timed-out run — costs minutes rather
than needing a human to notice. The sweep can only ever *remove* a gate that an
approval already satisfied; it never creates one.

To force it immediately, `workflow_dispatch` **Review clear** (cheap: it only
reads reviews and statuses).

`review-signal.yml` also has a `workflow_dispatch` for a full re-flag, which
recomputes gates from scratch (heavier — it re-reads every PR's files and diff):
- blank `pr` input → re-flag **all** open PRs (backfill / mass recovery)
- a PR number → re-flag just that one

Use that one if a gate needs to be re-*derived* (e.g. the workflow was added
after the PR was opened, or a stale check run lingers).

> **A human cannot hand-clear this gate.** Branch protection requires the
> `review-required` context *from the GitHub Actions app* (`app_id` 15368). A
> status posted with a personal token turns the PR's rollup green but does not
> satisfy the requirement — the merge stays blocked. Only a workflow run can
> genuinely clear it, which is why the automated sweep is the recovery path.

## The Copilot reviewer is separate

GitHub Copilot reviews PRs using `.github/copilot-instructions.md` and the
path-scoped `.github/instructions/*`. It is **advisory** — it posts a summary
(leading 🔴/🟡/🟢) and inline comments, and reads the gate labels to focus its
review, but it never sets or clears the gate.
