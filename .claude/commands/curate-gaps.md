# Curate Gap Reports

Analyze open gap reports and produce a curated gap analysis issue.

## Arguments

$ARGUMENTS

Use `--close` to close raw gap reports after curating (links them to the analysis issue).

## Instructions

### 1. Fetch all open gap reports

```bash
gh issue list --repo facebookexperimental/xds --label gap-report --state open --json number,title,body,createdAt --limit 200
```

If there are zero open gap reports, tell the user and stop.

### 2. Parse and analyze

For each issue, extract:

- **Component** (from the table in the body)
- **Category** (from the table)
- **Source** (interactive, llm-auto, cli)
- **User Intention** (the section after "## User Intention")

Focus on **user intention** — what builders were trying to achieve — not specific prop/API requests.

### 3. Group by themes

Identify high-level themes across the reports:

- Common intentions (e.g. "need dense/compact variants", "missing responsive behavior")
- Component hotspots (which components appear most often)
- Category distribution

### 4. Create curated analysis issue

Create the label first, then the issue:

```bash
gh label create gap-analysis --repo facebookexperimental/xds --color 0E8A16 --description "Curated gap analysis summary" --force
```

Then create the issue. Use this format for the body:

```
## Gap Analysis: <Month> <Year>

**<N> gap reports analyzed** | Period: <earliest date> — <latest date>

### Top User Intentions

1. **<Theme>** (<count> reports)
   - <Summarized intention>
   - Evidence: #<issue>, #<issue>

2. **<Theme>** (<count> reports)
   - <Summarized intention>
   - Evidence: #<issue>, #<issue>

(continue for all themes)

### Component Hotspots

| Component | Reports | Top Category |
|-----------|---------|-------------|
| <Name>    | <N>     | <category>  |

### Category Distribution

| Category | Count |
|----------|-------|
| <cat>    | <N>   |

### Recommendations

1. <Actionable recommendation based on evidence>
2. <Actionable recommendation based on evidence>

<details>
<summary>Raw Reports (<N> total)</summary>

| # | Component | Category | Intention |
|---|-----------|----------|-----------|
| #<num> | <comp> | <cat> | <brief intention> |

</details>
```

Create the issue:

```bash
gh issue create --repo facebookexperimental/xds --title "Gap Analysis: <Month> <Year> — <primary theme>" --label gap-analysis --body "<body>"
```

### 5. Optionally close raw reports

Only if the user passed `--close` as an argument:

For each raw gap report, add a comment and close it:

```bash
gh issue comment <number> --repo facebookexperimental/xds --body "Curated into gap analysis #<analysis-issue-number>"
gh issue close <number> --repo facebookexperimental/xds
```

### 6. Report results

Print the URL of the created gap analysis issue and a summary of what was processed.
