#!/usr/bin/env python3
# Copyright (c) Meta Platforms, Inc. and affiliates.

"""
Post Night Watch design judge results as a GitHub issue comment.

Images are served from GitHub Pages (gh-pages branch) under
reports/{iteration}/screenshots/. No GitHub releases needed.

Usage:
    python3 post-design-results.py \
        --scores /tmp/design-scores-gemini.json \
        --iteration fd6afde6 \
        --issue 1041 \
        --repo facebook/astryx \
        --token $GITHUB_TOKEN

    # Legacy flag still accepted for backward compat:
    python3 post-design-results.py \
        --scores /tmp/design-scores-gemini.json \
        --release-tag design-judge-fd6afde6 \
        --issue 1041 \
        --repo facebook/astryx \
        --token $GITHUB_TOKEN
"""
import argparse
import json
import sys
import urllib.request
import urllib.error


EMOJI = {"astryx": "🟣", "baseline": "⚪", "html": "🟠"}
PROMPT_LABELS = {
    "dd-1": "Data table with sortable columns",
    "dd-2": "Transaction list with amount, date, status",
    "dd-3": "Analytics dashboard with charts",
    "fwc-1": "Login form with validation",
    "fwc-2": "Multi-step form wizard",
    "fwc-3": "Search with autocomplete",
    "fwc-4": "Confirmation delete dialog",
    "io-1": "Empty state with call to action",
    "io-2": "Loading skeleton screens",
    "io-3": "Toast notification stack",
    "io-4": "Progress indicator",
    "ps-1": "Product grid with filters",
    "ps-2": "Product card with quick actions",
    "ps-3": "Shopping cart summary",
    "ps-4": "Product detail with breadcrumbs",
    "rc-1": "Responsive navigation menu",
    "rc-2": "Sidebar to bottom sheet on mobile",
    "rc-3": "Responsive data table to cards",
    "sd-1": "Button with loading state",
    "sd-2": "Loading to success button states",
    "tc-1": "Color scheme switcher",
    "tc-3": "Typography scale demo",
    "tc-6": "Settings page with theme controls",
    "ty-1": "Article with rich typography",
    "ty-3": "Metrics dashboard card",
    "wd-1": "E-commerce checkout flow",
    "wd-2": "User registration wizard",
    "wd-3": "Onboarding flow (4 steps)",
    "cwm-1": "Rich text editor toolbar",
    "cwm-2": "Kanban board with drag handles",
    "cwm-3": "Notion page header with icon/cover picker",
}


# GitHub Pages base URL for the Astryx repo
GH_PAGES_BASE = "https://facebook.github.io/astryx"


def img_url(iteration_id, filename):
    """Build image URL from gh-pages screenshots directory."""
    return f"{GH_PAGES_BASE}/reports/{iteration_id}/screenshots/{filename}"


def ideal_url(filename):
    """Build image URL for ideal reference images on gh-pages."""
    return f"{GH_PAGES_BASE}/reports/ideals/{filename}"


def score_emoji(score):
    if score is None or score == "—":
        return "—"
    if score >= 80:
        return f"✅ **{score}**"
    if score >= 50:
        return f"🟡 **{score}**"
    return f"🔴 **{score}**"


def build_comment(data, iteration_id_override=None):
    results = data["results"]
    averages = data.get("averages", {})
    iteration_id = iteration_id_override or data["iterationId"]
    model = data["model"]
    targets = ["astryx", "baseline", "html"]

    lines = []
    lines.append(f"## 🔬 Night Watch Design Judge — Gemini Vision")
    lines.append("")
    lines.append(f"**Judge:** `{model}` via Meta InternalProxy | **Iteration:** `{iteration_id}` | **Method:** mTLS (no external API key)")
    lines.append("")

    # Overall averages table
    lines.append("### Overall Averages")
    lines.append("")
    lines.append("| Target | Layout | Hierarchy | Spacing | Components | Color | **Overall** |")
    lines.append("|--------|--------|-----------|---------|------------|-------|-------------|")
    for t in targets:
        if t in averages:
            a = averages[t]
            lines.append(
                f"| {t.upper()} | {a['layout']} | {a['hierarchy']} | {a['spacing']} | "
                f"{a['components']} | {a['color']} | **{a['overall']}** |"
            )
    lines.append("")
    lines.append("---")
    lines.append("")

    # Per-prompt sections
    for pid, pd in sorted(results.items()):
        label = PROMPT_LABELS.get(pid, pid)
        scores = {t: pd.get(t, {}).get("overall") for t in targets}
        valid = [s for s in scores.values() if s is not None]
        best = max(valid) if valid else None

        # Section header with best scores
        score_parts = " | ".join(
            f"{t.upper()}: {s if s is not None else 'n/a'}"
            for t, s in scores.items()
        )
        status = "✅" if best and best >= 70 else ("🟡" if best and best >= 40 else "🔴")
        lines.append(f"#### {status} {pid} — {label}")
        lines.append(f"**{score_parts}**")
        lines.append("")

        # Score table
        lines.append("| Target | Layout | Hier | Space | Comp | Color | Overall | Notes |")
        lines.append("|--------|--------|------|-------|------|-------|---------|-------|")
        for t in targets:
            if t in pd:
                j = pd[t]
                notes = j.get("notes", "")[:80]
                overall = j.get("overall", "—")
                lines.append(
                    f"| {t.upper()} | {j.get('layout','—')} | {j.get('hierarchy','—')} | "
                    f"{j.get('spacing','—')} | {j.get('components','—')} | {j.get('color','—')} | "
                    f"**{overall}** | {notes} |"
                )
            else:
                lines.append(f"| {t.upper()} | — | — | — | — | — | **n/a** | No screenshot |")
        lines.append("")

        # Screenshot images
        has_baseline = "baseline" in pd
        if has_baseline:
            lines.append("**Ideal** | **Astryx** | **Baseline** | **HTML**")
            lines.append(":--: | :--: | :--: | :--:")
            lines.append(
                f'<img src="{ideal_url(f"{pid}.png")}" width="220"> | '
                f'<img src="{img_url(iteration_id, f"{pid}-astryx-desktop-light.png")}" width="220"> | '
                f'<img src="{img_url(iteration_id, f"{pid}-baseline-desktop-light.png")}" width="220"> | '
                f'<img src="{img_url(iteration_id, f"{pid}-html-desktop-light.png")}" width="220">'
            )
        else:
            lines.append("**Ideal** | **Astryx** | **HTML**")
            lines.append(":--: | :--: | :--:")
            lines.append(
                f'<img src="{ideal_url(f"{pid}.png")}" width="220"> | '
                f'<img src="{img_url(iteration_id, f"{pid}-astryx-desktop-light.png")}" width="220"> | '
                f'<img src="{img_url(iteration_id, f"{pid}-html-desktop-light.png")}" width="220">'
            )
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("— via Navi on behalf of Ernest Tien")
    return "\n".join(lines)


def post_comment(body, repo, issue_number, token):
    url = f"https://api.github.com/repos/{repo}/issues/{issue_number}/comments"
    data = json.dumps({"body": body}).encode()
    req = urllib.request.Request(
        url,
        data=data,
        headers={
            "Authorization": f"token {token}",
            "Content-Type": "application/json",
            "Accept": "application/vnd.github.v3+json",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req) as resp:
            result = json.load(resp)
            print(f"Posted: {result['html_url']}")
            return result["html_url"]
    except urllib.error.HTTPError as e:
        print(f"HTTP error {e.code}: {e.read().decode()}", file=sys.stderr)
        sys.exit(1)


def main():
    p = argparse.ArgumentParser(description="Post design judge results to GitHub issue")
    p.add_argument("--scores", required=True, help="Path to design-scores-gemini.json")
    p.add_argument("--iteration", help="Iteration ID (images served from gh-pages)")
    p.add_argument("--release-tag", help="(deprecated) GitHub release tag — ignored, kept for backward compat")
    p.add_argument("--issue", required=True, type=int, help="GitHub issue number")
    p.add_argument("--repo", default="facebook/astryx", help="GitHub repo")
    p.add_argument("--token", required=True, help="GitHub token")
    p.add_argument("--dry-run", action="store_true", help="Print comment without posting")
    args = p.parse_args()

    with open(args.scores) as f:
        data = json.load(f)

    # Resolve iteration ID: explicit flag > extract from release-tag > scores file
    iteration_id = args.iteration
    if not iteration_id and args.release_tag:
        # Extract from legacy release tag: "design-judge-fd6afde6" -> "fd6afde6"
        iteration_id = args.release_tag.replace("design-judge-", "")
    if not iteration_id:
        iteration_id = data.get("iterationId")
    if not iteration_id:
        print("Error: --iteration is required (or iterationId must be in scores file)", file=sys.stderr)
        sys.exit(1)

    body = build_comment(data, iteration_id)

    if args.dry_run:
        print(body)
        return

    post_comment(body, args.repo, args.issue, args.token)


if __name__ == "__main__":
    main()
