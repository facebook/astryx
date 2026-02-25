# After Hours — XDS Project Health

Automated project stewardship for [facebookexperimental/xds](https://github.com/facebookexperimental/xds) outside business hours (5pm–9am PST, weekends, holidays).

This document is read by Navi on an hourly schedule during off-hours. Each run performs a triage pass across issues, PRs, and CI health — then takes action or reports.

---

## Principles

1. **Don't block humans.** The goal is that when maintainers arrive in the morning, everything is green and every issue is actionable.
2. **Fix what's broken.** If CI is red on a Navi-authored PR, fix it. Don't wait.
3. **Triage, don't decide.** For issues filed by others, add context and ask clarifying questions — don't unilaterally close or implement without maintainer sign-off.
4. **Small, safe changes only.** After-hours fixes should be scoped to what CI is complaining about: type errors, lint failures, test regressions, missing exports. No feature work, no refactors.
5. **Leave a trail.** Every action taken gets logged in the run summary. Maintainers should be able to see exactly what happened overnight.

---

## Hourly Checklist

### 1. PR Health — Fix Red Builds

Scan all open PRs authored by `navi-bot` / Navi for failing CI checks.

```bash
gh pr list --repo facebookexperimental/xds --state open --json number,title,headRefName,statusCheckRollup,author \
  --jq '[.[] | select(.author.login == "navi-bot" or .author.login == "navi[bot]") | {number, title, branch: .headRefName, checks: [.statusCheckRollup? | select(.conclusion == "FAILURE") | .name]}] | .[] | select(.checks | length > 0)'
```

For each failing PR:

1. **Identify the failure.** Check the workflow run logs:
   ```bash
   gh run list --repo facebookexperimental/xds --branch {branch} --limit 1 --json databaseId,conclusion \
     --jq '.[0].databaseId'
   gh run view {runId} --repo facebookexperimental/xds --log-failed 2>/dev/null | tail -100
   ```

2. **Classify the failure:**
   - `test` — Read the test output, check out the branch, fix the test or the code
   - `build` — Usually a TypeScript error or missing export. Fix the type error.
   - `lint` — Run `yarn lint --fix` on the branch and push
   - `pr-screenshots` / `pr-a11y` — Flaky infra; re-run the workflow:
     ```bash
     gh run rerun {runId} --repo facebookexperimental/xds --failed
     ```

3. **Fix and push** (for test/build/lint failures on Navi branches):
   ```bash
   gh pr checkout {number} --repo facebookexperimental/xds
   # ... make fixes ...
   yarn test
   yarn build
   yarn lint
   git add -A
   git commit -m "fix: address CI failure in {check_name}

   Co-authored-by: Navi <navi@multimango.com>"
   git push
   git checkout main
   ```

4. **For non-Navi PRs with failures:** Leave a helpful comment diagnosing the issue, but don't push to their branch.
   ```bash
   gh pr comment {number} --repo facebookexperimental/xds \
     --body "CI is failing on \`{check_name}\`. The error is: ..."
   ```

### 2. PR Health — Review All Open PRs

For every open PR (not just Navi-authored), check:

- **Stale PRs** (no activity for 7+ days): Comment asking if the author needs help or if the PR should be closed.
- **PRs with all checks green but no review:** Flag for morning review.
- **External contributor PRs:** Verify CLA is signed. Check for obvious issues (security, breaking changes, missing tests).
- **Draft PRs older than 14 days:** Comment asking about status.

```bash
gh pr list --repo facebookexperimental/xds --state open \
  --json number,title,author,updatedAt,isDraft,reviewDecision,statusCheckRollup \
  --jq '.[] | {number, title, author: .author.login, updated: .updatedAt, draft: .isDraft, review: .reviewDecision, allGreen: ([.statusCheckRollup[]? | select(.conclusion == "FAILURE")] | length == 0)}'
```

### 3. Issue Triage — Ensure Implementability

For each open issue, verify it has enough information to be implemented:

```bash
gh issue list --repo facebookexperimental/xds --state open --limit 50 \
  --json number,title,labels,body,comments,createdAt \
  --jq '.[] | {number, title, labels: [.labels[].name], bodyLength: (.body | length), commentCount: (.comments | length)}'
```

**An implementable issue needs:**

| Category | Required | Missing → Action |
|----------|----------|-------------------|
| `enhancement` (new component) | API sketch (props), visual reference or description, at least one usage example | Comment asking for the missing piece |
| `enhancement` (feature) | Which component, what behavior changes, before/after | Comment asking for specifics |
| `bug` | Steps to reproduce, expected vs actual behavior, browser/version if relevant | Comment asking for repro steps |
| `discussion` | A clear question or decision to be made | No action needed — discussions are open-ended |
| `vibe-test` | Auto-generated, no action needed | Skip |

**Comment template for under-specified issues:**

```markdown
This issue needs a bit more detail before it can be picked up for implementation:

- [ ] {specific missing item}
- [ ] {specific missing item}

Once these are filled in, this is ready to build. Happy to help draft any of these if useful.
```

**Do NOT comment on issues that:**
- Already have a linked PR (check for "closes #N" or PR references in comments)
- Were filed in the last 24 hours (give the author time to add detail)
- Are labeled `discussion` or `design` (these are exploratory by nature)
- Already have a triage comment from a previous run

### 4. Issue Labeling

If an issue is missing labels, suggest them:
- Component name mentioned → `component`
- Bug report → `bug`
- Feature request → `enhancement`
- Theming related → `theming`
- Unclear scope → `discussion`

```bash
gh issue edit {number} --repo facebookexperimental/xds --add-label "{label}"
```

### 5. Dependency & Security

Once per night (not every hour), check for:
- Dependabot alerts:
  ```bash
  gh api repos/facebookexperimental/xds/dependabot/alerts --jq '[.[] | select(.state == "open")] | length'
  ```
- Outdated dependencies with known vulnerabilities (if `yarn audit` is available)

### 6. Stale Branch Cleanup

Identify merged branches that haven't been deleted:
```bash
gh api repos/facebookexperimental/xds/branches --jq '[.[] | select(.name != "main" and .name != "gh-pages")] | .[].name' | head -20
```

Don't delete branches — just note them in the summary for maintainers.

---

## What NOT to Do

- ❌ **Don't merge PRs.** Only maintainers merge.
- ❌ **Don't close issues.** Flag them, don't close them.
- ❌ **Don't implement features.** After-hours is for health, not velocity.
- ❌ **Don't push to `main`.** All changes go through PR branches.
- ❌ **Don't push to other people's branches.** Comment with suggestions instead.
- ❌ **Don't re-comment on issues you've already triaged.** Check for existing triage comments first.
- ❌ **Don't refactor passing code.** If it's green, leave it alone.

---

## State Tracking

State is persisted at `memory/xds-after-hours-state.json` in Navi's workspace:

```json
{
  "lastRun": "2026-02-25T06:00:00Z",
  "lastFullRun": "2026-02-25T02:00:00Z",
  "triagedIssues": {
    "277": { "commentedAt": "2026-02-25T02:15:00Z", "status": "needs-repro" },
    "275": { "commentedAt": "2026-02-25T02:16:00Z", "status": "needs-api-sketch" }
  },
  "fixedPRs": {
    "331": { "fixedAt": "2026-02-25T03:00:00Z", "failure": "build", "commit": "abc1234" }
  },
  "stalePRsNotified": [205, 230],
  "dependabotAlertCount": 0,
  "runsToday": 3
}
```

Before commenting on an issue, check `triagedIssues` to avoid duplicate comments.
Before fixing a PR, check `fixedPRs` to avoid re-fixing what's already been addressed.

---

## Schedule

This runs hourly during off-hours, defined as:

| Window | Schedule (PST) | Cron (UTC) |
|--------|----------------|------------|
| Weeknight evening | 5pm–midnight PST | `0 1-8 * * 1-5` (UTC next day) |
| Weeknight overnight | midnight–9am PST | `0 8-17 * * 2-6` (UTC) |
| Weekend (all day) | 24h Sat–Sun | `0 * * * 0,6` (UTC, all hours Sat/Sun) |

Simplified: run every hour *except* 9am–5pm PST on weekdays.

**Cron expression (UTC):** `0 1-17 * * *` with a runtime guard:

```javascript
// Skip if currently 9am-5pm PST (17:00-01:00 UTC) on a weekday
const now = new Date();
const pstHour = (now.getUTCHours() - 8 + 24) % 24;
const pstDay = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' })).getDay();
const isBusinessHours = pstDay >= 1 && pstDay <= 5 && pstHour >= 9 && pstHour < 17;
if (isBusinessHours) { /* skip this run */ }
```

---

## Run Summary Template

After each run, log to `memory/xds-after-hours/{date}.md`:

```markdown
## After Hours Run — {timestamp}

### PR Health
- Checked {N} open PRs
- {N} green, {N} failing, {N} in progress
- Fixed: PR #{X} ({failure type}) — pushed {commit}
- Commented: PR #{Y} — diagnosed {issue}

### Issue Triage
- Reviewed {N} open issues
- {N} implementable, {N} need detail
- Commented on: #{A} (needs API sketch), #{B} (needs repro)
- Skipped: #{C} (discussion), #{D} (already triaged)

### Alerts
- Dependabot: {N} open alerts
- Stale branches: {list}

### No Action Needed
- All PRs green ✅
- All issues have sufficient detail ✅
```

---

## XDS Review Standards Reference

When evaluating PRs or issues, apply the [XDS Code Review Guide](/.claude/commands/create-component.md) principles:

1. **Primitive reuse** — XDSDialog, XDSButton, XDSIcon, XDSDivider, XDSSpinner
2. **StyleX tokens** — colorVars, spacingVars, radiusVars, fontVars (no hardcoded values)
3. **Accessibility** — ARIA roles, keyboard navigation, aria-label on icon buttons
4. **Theming** — ComponentStyles module augmentation, icon registry
5. **Composition** — Files under ~400 lines, sub-components extracted, displayName set
6. **Tests** — Colocated tests, render + interaction + accessibility coverage

### CI Checks Reference

| Check | What It Does | Common Failures |
|-------|-------------|-----------------|
| `test` | `yarn test` (Vitest) | Assertion failures, missing mocks, snapshot drift |
| `build` | `yarn build` (TypeScript + StyleX) | Type errors, missing exports, StyleX compilation |
| `lint` | ESLint | Import order, unused vars, React hooks rules |
| `check-components` | Detects if core components changed | Gate for screenshots/a11y — rarely fails |
| `pr-screenshots` | Playwright captures of Storybook stories | Flaky — re-run if infra failure |
| `pr-a11y` | axe-core audit of component stories | Real a11y violations — fix these |
| `Meta CLA Check` | CLA signature verification | External contributors need to sign CLA |
