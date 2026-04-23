#!/usr/bin/env python3
"""
Post Night Watch design judge results as a GitHub issue comment.

Images are uploaded as GitHub release assets under a per-iteration release
tag (design-judge-{iteration}). This ensures images render inline in issue
comments even for private repositories — GitHub Pages URLs don't work
because the repo is private and GitHub's image proxy can't authenticate.

Usage:
    python3 post-design-results.py \
        --scores /tmp/design-scores-gemini.json \
        --iteration fd6afde6 \
        --screenshots /tmp/night-watch-judge/fd6afde6 \
        --ideals ~/xds/worktrees/main/internal/vibe-tests/ideals \
        --issue 1041 \
        --repo facebookexperimental/xds \
        --token $GITHUB_TOKEN
"""
import argparse
import json
import os
import sys
import time
import urllib.request
import urllib.error


EMOJI = {"xds": "🟣", "baseline": "⚪", "html": "🟠"}
PROMPT_LABELS = {
    "dd-1": "Data table with sortable columns",
    "dd-2": "Transaction list with amount, date, status",
    "dd-3": "Analytics dashboard with charts",
    "dd-7": "Service status dashboard",
    "fwc-1": "Login form with validation",
    "fwc-2": "Multi-step form wizard",
    "fwc-3": "Search with autocomplete",
    "fwc-4": "Confirmation delete dialog",
    "fwc-7": "Price range filter",
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
    "sd-5": "Notification preferences",
    "tc-1": "Color scheme switcher",
    "tc-3": "Typography scale demo",
    "tc-6": "Settings page with theme controls",
    "tc-9": "Dual themes",
    "ty-1": "Article with rich typography",
    "ty-3": "Metrics dashboard card",
    "wd-1": "E-commerce checkout flow",
    "wd-2": "User registration wizard",
    "wd-3": "Onboarding flow (4 steps)",
    "cwm-1": "Rich text editor toolbar",
    "cwm-2": "Kanban board with drag handles",
    "cwm-3": "Notion page header with icon/cover picker",
}


# ── GitHub Release Asset Upload ────────────────────────────────────────

def gh_api(method, path, token, data=None, content_type="application/json",
           accept="application/vnd.github.v3+json", base="https://api.github.com"):
    """Make a GitHub API request."""
    url = f"{base}/{path}" if not path.startswith("http") else path
    body = json.dumps(data).encode() if isinstance(data, dict) else data
    req = urllib.request.Request(url, data=body, method=method, headers={
        "Authorization": f"token {token}",
        "Accept": accept,
        **({"Content-Type": content_type} if body else {}),
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        err = e.read().decode()
        raise RuntimeError(f"GitHub API {method} {url} → {e.code}: {err}")


def ensure_release(repo, tag, token):
    """Get or create a published release for the given tag. Returns release dict.

    Must be a published (non-draft) release — draft release asset URLs
    don't render inline in issue comments for private repos.
    """
    # Check if release already exists
    try:
        return gh_api("GET", f"repos/{repo}/releases/tags/{tag}", token)
    except RuntimeError:
        pass

    # Create new published release (not draft — draft assets don't render inline)
    return gh_api("POST", f"repos/{repo}/releases", token, data={
        "tag_name": tag,
        "name": f"Design Judge — {tag.replace('design-judge-', '')}",
        "body": "Screenshots uploaded by the Night Watch Design Judge pipeline.",
        "draft": False,
    })


def upload_asset(release, filepath, token):
    """Upload a file as a release asset. Returns the download URL."""
    filename = os.path.basename(filepath)
    upload_url = release["upload_url"].split("{")[0]  # strip template suffix

    # Check if asset already exists
    for asset in release.get("assets", []):
        if asset["name"] == filename:
            return asset["browser_download_url"]

    # Also check via API (release dict may not have all assets if just created)
    try:
        assets = gh_api("GET", release["assets_url"], token)
        for asset in assets:
            if asset["name"] == filename:
                return asset["browser_download_url"]
    except RuntimeError:
        pass

    with open(filepath, "rb") as f:
        data = f.read()

    url = f"{upload_url}?name={urllib.request.quote(filename)}"
    result = gh_api("POST", url, token, data=data,
                    content_type="application/octet-stream",
                    base="")  # upload_url is already absolute
    return result["browser_download_url"]


def upload_screenshots(repo, iteration_id, screenshots_dir, ideals_dir,
                       needed_files, token):
    """Upload all needed screenshots and ideals to a GitHub release.

    Returns a dict mapping filename → download URL.
    """
    tag = f"design-judge-{iteration_id}"
    print(f"  Ensuring release '{tag}'...")
    release = ensure_release(repo, tag, token)

    url_map = {}
    for filename in needed_files:
        # Check screenshots dir first, then ideals dir
        filepath = os.path.join(screenshots_dir, filename) if screenshots_dir else None
        if not filepath or not os.path.exists(filepath):
            if ideals_dir:
                filepath = os.path.join(ideals_dir, filename)
        if not filepath or not os.path.exists(filepath):
            print(f"    ⚠ Missing: {filename}")
            continue

        print(f"    Uploading {filename}...")
        try:
            url_map[filename] = upload_asset(release, filepath, token)
            time.sleep(0.3)  # rate limiting
        except RuntimeError as e:
            print(f"    ⚠ Upload failed for {filename}: {e}")

    print(f"  Uploaded {len(url_map)}/{len(needed_files)} images")
    return url_map


# ── Comment Builder ────────────────────────────────────────────────────

def build_comment(data, iteration_id, image_urls):
    """Build the GitHub issue comment markdown.

    image_urls: dict mapping filename → download URL (from release assets).
    Falls back to a placeholder if an image URL is missing.
    """
    results = data["results"]
    averages = data.get("averages", {})
    model = data["model"]
    targets = ["xds", "baseline", "html"]

    def img(filename, width=220):
        url = image_urls.get(filename)
        if url:
            return f'<img src="{url}" width="{width}">'
        return f'`{filename}` _(missing)_'

    lines = []
    lines.append(f"## 🔬 Night Watch Design Judge — Gemini Vision")
    lines.append("")
    lines.append(f"**Judge:** `{model}` via Meta Plugboard | "
                 f"**Iteration:** `{iteration_id}` | **Method:** mTLS (no external API key)")
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
        ideal = img(f"{pid}.png")
        xds = img(f"{pid}-xds-desktop-light.png")
        html_img = img(f"{pid}-html-desktop-light.png")

        has_baseline = "baseline" in pd
        if has_baseline:
            baseline = img(f"{pid}-baseline-desktop-light.png")
            lines.append("**Ideal** | **XDS** | **Baseline** | **HTML**")
            lines.append(":--: | :--: | :--: | :--:")
            lines.append(f"{ideal} | {xds} | {baseline} | {html_img}")
        else:
            lines.append("**Ideal** | **XDS** | **HTML**")
            lines.append(":--: | :--: | :--:")
            lines.append(f"{ideal} | {xds} | {html_img}")
        lines.append("")
        lines.append("---")
        lines.append("")

    lines.append("— via Navi on behalf of Ernest Tien")
    return "\n".join(lines)


def collect_needed_files(data):
    """Collect all image filenames needed for the comment."""
    results = data["results"]
    targets = ["xds", "baseline", "html"]
    files = set()

    for pid, pd in results.items():
        files.add(f"{pid}.png")  # ideal
        for t in targets:
            if t in pd:
                files.add(f"{pid}-{t}-desktop-light.png")

    return sorted(files)


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
    p.add_argument("--iteration", help="Iteration ID")
    p.add_argument("--screenshots", help="Directory containing screenshot PNGs")
    p.add_argument("--ideals", help="Directory containing ideal reference PNGs")
    p.add_argument("--release-tag", help="(deprecated) Ignored, kept for backward compat")
    p.add_argument("--issue", required=True, type=int, help="GitHub issue number")
    p.add_argument("--repo", default="facebookexperimental/xds", help="GitHub repo")
    p.add_argument("--token", required=True, help="GitHub token")
    p.add_argument("--dry-run", action="store_true", help="Print comment without posting")
    args = p.parse_args()

    with open(args.scores) as f:
        data = json.load(f)

    # Resolve iteration ID
    iteration_id = args.iteration
    if not iteration_id and args.release_tag:
        iteration_id = args.release_tag.replace("design-judge-", "")
    if not iteration_id:
        iteration_id = data.get("iterationId")
    if not iteration_id:
        print("Error: --iteration is required", file=sys.stderr)
        sys.exit(1)

    # Collect needed files and upload to release
    needed_files = collect_needed_files(data)
    image_urls = {}

    if args.screenshots or args.ideals:
        print(f"Uploading {len(needed_files)} images to GitHub release...")
        image_urls = upload_screenshots(
            args.repo, iteration_id,
            args.screenshots, args.ideals,
            needed_files, args.token,
        )
    else:
        print("Warning: No --screenshots or --ideals provided. Images will show as missing.",
              file=sys.stderr)

    body = build_comment(data, iteration_id, image_urls)

    if args.dry_run:
        print(body)
        return

    post_comment(body, args.repo, args.issue, args.token)


if __name__ == "__main__":
    main()
