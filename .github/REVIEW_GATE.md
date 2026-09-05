# Review gate

How pull requests are gated for review in this repo. The goal: **let the team
move fast in their own domain, require review where risk or unfamiliarity
warrants it, and keep the PR queue readable** (a PR awaiting review shows a
neutral yellow "waiting" signal, not a red failure).

## TL;DR

| Author                            | High-risk code    | Design-affecting change          | Everything else   |
| --------------------------------- | ----------------- | -------------------------------- | ----------------- |
| **Eng owner** (`ENGOWNERS`)       | self-serve        | advisory label only              | self-serve        |
| **Design owner** (`DESIGNOWNERS`) | needs code review | self-serve                       | self-serve        |
| **Contributor** (anyone else)     | needs code review | needs code review + design label | needs code review |
| **Bot** (Dependabot, etc.)        | exempt            | exempt                           | exempt            |

- **Code review is the only hard gate.** It shows up as the `review-required`
  status: `pending` (🟡, blocks the merge) or `success` (🟢).
- **Design review is advisory** — it labels the PR and requests design owners,
  but does not block the merge.
- An entitled owner's **approval clears the gate automatically** (no manual step).

## Spec records

Any PR that creates, changes, or archives a `current` architecture, component,
family, design, or system spec waits on `spec-owner-approval` for its exact
current head. `cixzhang` or `imdreamrunner` can approve every record kind.
Current design records and normative design assets may also be approved by any
handle in `.github/DESIGNOWNERS`. Mixed PRs still require `cixzhang` or
`imdreamrunner` for non-design current records. Same-repository owner reviews
update the exact-head approval automatically. Fork review events cannot write
with their read-only token, so an approver uses an issue comment containing
`/approve-spec <full-head-sha>` instead; that command runs from the trusted
default branch and a new commit invalidates it.

Only that exact form decides the gate. The command must start the comment,
lowercase and unindented, because the workflow trigger matches the raw comment
body — an indented or capitalized command never starts the workflow, so the
parser refuses it too rather than counting a comment nobody's run ever saw. The
SHA itself may be either casing. A command that names no commit, names
something other than one full 40-character SHA, or names a superseded commit
changes nothing — so the gate replies once per head with the exact command to
copy, rather than leaving the owner believing they approved.

The gate never re-decides a merged or closed head. A run that starts after the
merge publishes nothing, and neither does a run yielding to a newer one.
GitHub has no conditional status write, so the window between the last read and
the write cannot be closed; the gate makes it one API call wide by reading the
live pull request last, and if a status still lands on a head that settled
during that window, the run logs the status as unverified and stops before
auto-merge.

When a DESIGNOWNER authors a PR, marking it ready for review attests that exact
head **for the design-approval group only**. The attestation is published only
for a `.github/DESIGNOWNERS` handle, and it is read back only for a handle that
is still in that file — a marker left by someone since removed, or published
before this rule existed, authorizes nothing. It satisfies no other group: the
spec and theme groups always need a real exact-head review or command from
someone in their own list. A spec or engineering owner cannot attest their own
head.

The attestation does not grant auto-merge by itself. The existing gate may enable
squash auto-merge only when every changed path is a recognized spec record,
every required owner group has approved the exact head, and all branch checks
pass. Normative assets and indexes are outside that scope; adding any code path
also prevents the spec-only auto-merge path.

A PR changes only spec records when every changed path is one of:

- `docs/specs/<id>/spec.md` or `plan.md`;
- a family or design spec (excluding indexes, templates, schemas, and assets);
- a colocated Core/Lab `<Name>.spec.md`.

Draft-only spec records can merge after validation without owner approval.
Pure spec-record PRs do not add Changesets because they do not release packages;
CI rejects a PR containing only spec records and `.changeset` entries.
That classification fails closed on an empty or truncated file list and checks
both sides of a rename. Pure spec-record PRs run knowledge validation, skip
runtime/build/visual work with successful required-status acknowledgements, and
enable squash auto-merge after owner approval. Mixed code/spec changes keep full
CI and never gain this auto-merge path.

## Sources of truth

| File                            | Meaning                                                          |
| ------------------------------- | ---------------------------------------------------------------- |
| `.github/ENGOWNERS`             | Engineering team. Self-serve **code**.                           |
| `.github/DESIGNOWNERS`          | Design team. Self-serve **design**. Checked first.               |
| `.github/CODEOWNERS` (`*` line) | Who can **clear** the code gate (and native review requirement). |

Author bucket is resolved in order: **design owner → eng owner → contributor.**
A handle in `DESIGNOWNERS` is treated as a design owner even if also an eng
owner. Anyone in neither file is a contributor (and gets a quiet `community`
label so the contribution queue is filterable).

## What counts as high-risk / design-affecting

Detection is **deterministic** (no LLM in the enforcement path): code detection
is path-based; design detection combines paths with a deterministic score over
the diff content (`.github/scripts/lib/classify-visual.js`), because most
component styling is an inline `stylex.create` edit in a `.tsx` that no path
pattern can see. `packages/lab/**` is filtered out entirely first — lab is
canary staging, so new components there are expected and never gate.

**High-risk code** (drives the code gate):

- a new package (`packages/<name>/package.json` added)
- a new component/module in a published `src/` (not lab)
- a runtime change under `packages/core/src/**` (incl. styling `.tsx`; excludes
  tests/docs/stories) — core has high blast radius
- a public API surface change (a `src/**/index.ts(x)` barrel or a
  `package.json`)
- **plus:** _any_ PR from a contributor (see policy note below)

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

③ branch protection on main
     required status context "review-required": pending blocks, success allows
     + 1 required approving review (native)
     ⇒ blocks non-admin merges even for write-access internal contributors
```

## Enforcement

`review-required` is a **required status check** on `main`, plus the native
"1 approving review" requirement. Because a required check blocks non-admin
merges regardless of write access, this holds internal contributors who have
write but are not owners. (Repo admins can still bypass.)

`spec-owner-approval` must be a required status context on `main` as well. It is
published on every PR — `success` when no knowledge records changed — so
requiring it does not permanently strand unrelated work. **Until it is in the
required list, a pending owner gate is advisory and does not block the merge
button.** If the repository ever enables a merge queue, this gate also has to
report on `merge_group` before the context is required, or queued entries stall
waiting for a status nothing publishes.

### Making it required (ordered; do not reorder)

An open PR whose head predates the gate has no `spec-owner-approval` status at
all. Requiring the context first would block those heads on a status no event
will produce, because the gate only runs on a new event. Backfill first.

1. Land the gate changes, so the default branch has the `backfill` dispatch
   input. `workflow_dispatch` always runs the default branch's copy.
2. List the heads that would strand:

   ```sh
   gh pr list --state open --limit 300 --json number,headRefOid \
     --jq '.[]|"\(.number) \(.headRefOid)"' \
   | while read -r pr sha; do
       state=$(gh api "repos/facebook/astryx/commits/$sha/status" \
         --jq '[.statuses[]|select(.context=="spec-owner-approval")|.state]
               | if length==0 then "MISSING" else .[0] end')
       [ "$state" = MISSING ] && echo "$pr"
     done
   ```

3. Backfill each one. `backfill=true` publishes the status and returns before
   auto-merge, so a reconcile cannot land a PR nobody asked to land:

   ```sh
   gh workflow run spec-owner-gate.yml -f pr=<number> -f backfill=true
   ```

4. Re-run the step 2 query and confirm it prints nothing.
5. Only then add `spec-owner-approval` to the required status checks on `main`.

A `pending` result from the backfill is the correct outcome for a PR that
genuinely awaits an owner, not a stranded head.

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

`review-signal.yml` has a `workflow_dispatch`:

- blank `pr` input → re-flag **all** open PRs (backfill / mass recovery)
- a PR number → re-flag just that one

Use it if a PR's `review-required` ever gets stuck (e.g. the workflow was added
after the PR was opened, or a stale check run lingers).
