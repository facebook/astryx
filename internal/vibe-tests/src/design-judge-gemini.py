#!/usr/bin/env python3
# Copyright (c) Meta Platforms, Inc. and affiliates.

"""
Night Watch Design Judge — Gemini 2.5 Pro Vision scoring.

Authenticates via GEMINI_API_KEY environment variable. In GitHub Actions,
this is read from the GEMINI_API_KEY repository secret.

Environment variables:
    GEMINI_API_KEY      — Required. Gemini API key.
    GEMINI_BASE_URL     — Optional. Override the Gemini API base URL.
                          Default: https://generativelanguage.googleapis.com/v1beta/models
    GEMINI_CERT         — Optional. Path to client cert for mTLS auth.
    GEMINI_CA           — Optional. Path to CA cert for mTLS auth.

Usage:
    python3 design-judge-gemini.py \
        --ideals internal/vibe-tests/ideals \
        --screenshots /tmp/vibe-screenshots-<iteration_id> \
        --iteration <iteration_id> \
        --output /tmp/design-scores-gemini.json

    # Resume a partial run:
    python3 design-judge-gemini.py ... --resume

    # Dry run (validate inputs, don't call API):
    python3 design-judge-gemini.py ... --dry-run
"""
import argparse
import base64
import json
import os
import re
import subprocess
import sys
import tempfile
import time

CERT = os.environ.get("GEMINI_CERT", "")
CA = os.environ.get("GEMINI_CA", "")
MODEL = "gemini-2.5-pro-preview"
BASE = os.environ.get("GEMINI_BASE_URL", "https://generativelanguage.googleapis.com/v1beta/models")
API_KEY = os.environ.get("GEMINI_API_KEY", "")
TARGETS = ["astryx", "baseline", "html"]

# Prompt registry — maps prompt ID to human-readable description for the judge
PROMPTS = {
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

# Note: {{ and }} are escaped braces so .format() works with {prompt_text}
JUDGE_PROMPT = """You are a professional UI design reviewer. Compare IMAGE 1 (ideal reference) to IMAGE 2 (generated output) for the prompt: "{prompt_text}"

Score IMAGE 2 against IMAGE 1 on 5 dimensions (0-100 each). Use the full scale — avoid clustering at 0/50/100. Most UIs score 20-90.

- layout (weight 25%): page structure, regions, stacking order, grid
- hierarchy (weight 25%): visual weight, heading/body size, primary action prominence
- spacing (weight 20%): margins, padding, gaps proportionally similar
- components (weight 15%): interactive element affordances, border-radius, shadows
- color (weight 15%): palette match, primary/accent/surface/text colors

Scoring guidance:
- Blank/error screenshot: 0-5
- Completely different UI: 5-20
- Right concept, looks different: 30-60
- Close with noticeable differences: 60-80
- Very close, minor differences: 80-95
- Near-identical: 95-100

Compute overall = layout*0.25 + hierarchy*0.25 + spacing*0.20 + components*0.15 + color*0.15

Respond with ONLY a JSON object (no explanation, no markdown):
{{"layout": <int>, "hierarchy": <int>, "spacing": <int>, "components": <int>, "color": <int>, "overall": <float>, "notes": "<1-2 sentences>"}}"""


def parse_args():
    p = argparse.ArgumentParser(description="Night Watch Design Judge (Gemini via InternalProxy)")
    p.add_argument("--ideals", required=True, help="Path to directory containing ideal PNG files")
    p.add_argument("--screenshots", required=True, help="Path to directory containing screenshot PNGs")
    p.add_argument("--iteration", required=True, help="Iteration ID (e.g. 7e7514ec)")
    p.add_argument("--output", default="/tmp/design-scores-gemini.json", help="Output JSON path")
    p.add_argument("--prompts", help="Comma-separated list of prompt IDs to score (default: all with ideals)")
    p.add_argument("--resume", action="store_true", help="Resume from existing output file")
    p.add_argument("--dry-run", action="store_true", help="Validate inputs without calling API")
    p.add_argument("--model", default=MODEL, help=f"Gemini model (default: {MODEL})")
    return p.parse_args()


def check_devvm():
    if not os.path.exists(CERT):
        print(f"ERROR: mTLS cert not found at {CERT}", file=sys.stderr)
        print("This script requires a Meta devvm or devgpu with machine identity certs.", file=sys.stderr)
        sys.exit(1)


def encode_image(path):
    with open(path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def call_gemini(ideal_path, screenshot_path, prompt_text, model=MODEL, dry_run=False):
    if dry_run:
        return {"layout": 0, "hierarchy": 0, "spacing": 0, "components": 0, "color": 0,
                "overall": 0.0, "notes": "DRY RUN"}

    ideal_b64 = encode_image(ideal_path)
    ss_b64 = encode_image(screenshot_path)

    payload = {
        "contents": [{"role": "user", "parts": [
            {"inlineData": {"mimeType": "image/png", "data": ideal_b64}},
            {"inlineData": {"mimeType": "image/png", "data": ss_b64}},
            {"text": JUDGE_PROMPT.format(prompt_text=prompt_text)}
        ]}],
        "generationConfig": {
            "temperature": 0.1,
            "maxOutputTokens": 4096,
            "responseMimeType": "application/json",
        },
    }

    with tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False) as f:
        json.dump(payload, f)
        tmpfile = f.name

    try:
        curl_cmd = [
            "curl", "-s", "-w", "\n%{http_code}",
            "-H", "Content-Type: application/json",
            "-H", f"x-goog-api-key: {API_KEY}",
            "-d", f"@{tmpfile}",
            f"{BASE}/{model}:generateContent",
        ]
        # Use mTLS certs if available (e.g. on internal devvms)
        if CERT and CA and os.path.exists(CERT) and os.path.exists(CA):
            curl_cmd[2:2] = ["--cert", CERT, "--cacert", CA]

        result = subprocess.run(
            curl_cmd,
            capture_output=True,
            text=True,
            timeout=120,
        )

        lines = result.stdout.strip().split("\n")
        http_code = lines[-1]
        body = "\n".join(lines[:-1])

        if http_code != "200":
            raise Exception(f"HTTP {http_code}: {body[:300]}")

        resp = json.loads(body)
        if "error" in resp:
            raise Exception(f"API error: {resp['error']}")

        text = resp["candidates"][0]["content"]["parts"][0]["text"].strip()
        # Strip markdown fences (Gemini wraps in ```json even with responseMimeType=json)
        text = re.sub(r"```json\s*", "", text)
        text = re.sub(r"```\s*", "", text).strip()

        return json.loads(text)
    finally:
        os.unlink(tmpfile)


def find_ideal(ideals_dir, prompt_id):
    """Find the most specific ideal image for a prompt ID."""
    candidates = [
        f"{prompt_id}__desktop__light.png",
        f"{prompt_id}__desktop.png",
        f"{prompt_id}.png",
    ]
    for name in candidates:
        path = os.path.join(ideals_dir, name)
        if os.path.exists(path):
            return path
    return None


def find_screenshot(screenshots_dir, prompt_id, target):
    """Find the desktop-light screenshot for a prompt/target."""
    name = f"{prompt_id}-{target}-desktop-light.png"
    path = os.path.join(screenshots_dir, name)
    if os.path.exists(path) and os.path.getsize(path) >= 1000:
        return path
    return None


def compute_averages(results, targets):
    keys = ["layout", "hierarchy", "spacing", "components", "color", "overall"]
    avgs = {t: {k: [] for k in keys} for t in targets}
    for pid, pd in results.items():
        for t in targets:
            if t in pd:
                for k in keys:
                    avgs[t][k].append(pd[t][k])
    return {
        t: {k: round(sum(v) / len(v), 1) for k, v in avgs[t].items()}
        for t in targets
        if avgs[t]["overall"]
    }


def print_summary(results, avg_out, prompts_to_score, targets):
    print(f"\n{'='*70}")
    print(f"{'Prompt':<8} {'Astryx':>6} {'Base':>6} {'HTML':>6}")
    print("-" * 30)
    for pid in prompts_to_score:
        if pid in results:
            x = results[pid].get("astryx", {}).get("overall", "—")
            b = results[pid].get("baseline", {}).get("overall", "—")
            h = results[pid].get("html", {}).get("overall", "—")
            print(f"{pid:<8} {str(x):>6} {str(b):>6} {str(h):>6}")
    print(f"\n{'Target':<10} {'Overall':>8}")
    print("-" * 20)
    for t in targets:
        if t in avg_out:
            print(f"{t:<10} {avg_out[t]['overall']:>8}")


def main():
    args = parse_args()
    check_devvm()

    model = args.model
    outfile = args.output

    # Determine which prompts to score
    if args.prompts:
        prompt_ids = [p.strip() for p in args.prompts.split(",")]
    else:
        # Auto-discover: all prompts that have an ideal image
        prompt_ids = sorted(
            pid for pid in PROMPTS
            if find_ideal(args.ideals, pid) is not None
        )

    print(f"Judge: {model}")
    print(f"Iteration: {args.iteration}")
    print(f"Prompts: {len(prompt_ids)}")
    print(f"Output: {outfile}")
    if args.dry_run:
        print("DRY RUN — no API calls will be made")
    print()

    # Load partial results if resuming
    results = {}
    if args.resume and os.path.exists(outfile):
        with open(outfile) as f:
            old = json.load(f)
            results = old.get("results", {})
            cached = sum(len(v) for v in results.values())
            if cached > 0:
                print(f"Resuming from {cached} existing scores\n")

    for pid in prompt_ids:
        prompt_text = PROMPTS.get(pid, pid)
        ideal = find_ideal(args.ideals, pid)
        if ideal is None:
            print(f"  SKIP {pid} — no ideal image")
            continue
        if pid not in results:
            results[pid] = {}

        for t in TARGETS:
            if t in results[pid] and results[pid][t].get("overall", -1) >= 0:
                print(f"  {pid}/{t} ... CACHED {results[pid][t]['overall']}")
                continue

            ss = find_screenshot(args.screenshots, pid, t)
            if ss is None:
                print(f"  SKIP {pid}/{t} — no screenshot")
                continue

            print(f"  {pid}/{t} ...", end=" ", flush=True)
            try:
                j = call_gemini(ideal, ss, prompt_text, model=model, dry_run=args.dry_run)
                results[pid][t] = j
                print(
                    f"{j['overall']:5.1f}  "
                    f"L:{j['layout']:2d} H:{j['hierarchy']:2d} S:{j['spacing']:2d} "
                    f"C:{j['components']:2d} Co:{j['color']:2d}  "
                    f"{j.get('notes', '')[:70]}"
                )
            except Exception as e:
                print(f"FAIL: {e}")

            # Save incrementally after every score
            partial = {
                "iterationId": args.iteration,
                "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
                "judge": f"{model}",
                "model": model,
                "results": results,
            }
            with open(outfile, "w") as f:
                json.dump(partial, f, indent=2)

            if not args.dry_run:
                time.sleep(2)

    avg_out = compute_averages(results, TARGETS)
    out = {
        "iterationId": args.iteration,
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ"),
        "judge": f"{model}",
        "model": model,
        "results": results,
        "averages": avg_out,
    }
    with open(outfile, "w") as f:
        json.dump(out, f, indent=2)

    print_summary(results, avg_out, prompt_ids, TARGETS)
    print(f"\nSaved to {outfile}")


if __name__ == "__main__":
    main()
