# Delivery-mode vibe tests

This harness compares Astryx consumer delivery modes while holding the prompt battery, runners, and evaluator constant. It ships two public configurations that work without local product assets:

- `react-build`: Vite, React 19, published npm packages, and generated agent docs.
- `react-nobuild`: one `index.html` using React 19, htm, and published CDN assets.

A third, generic `static-html` configuration accepts stylesheet and script URLs plus an optional CLI tarball. It replaces product-specific build-less modes: any static delivery can be expressed as a local config without committing pins or launcher details.

Each matrix cell gets a fresh private project. Generated source, transcripts, screenshots, checkpoints, and reports are written outside tracked paths.

## Dry run and tests

A dry run prints the exact task prompts without loading a runner profile, installing packages, or starting an agent CLI:

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run --sample 3 --dry-run
pnpm -F @astryxdesign/vibe-tests delivery:test
```

The task and output contract are shared. Only the factual delivery description and required output filename differ. Evaluation-only expected components and path-selection coaching are never included.

## Runner profile

Real runs require runner and sandbox details from one of these local inputs:

```sh
VIBE_RUNNER_PROFILE=/absolute/path/to/runner-profile.json \
  pnpm -F @astryxdesign/vibe-tests delivery:run --sample 3

VIBE_RUNNER_PROFILE_JSON="$(cat /absolute/path/to/runner-profile.json)" \
  pnpm -F @astryxdesign/vibe-tests delivery:run --sample 3
```

Do not commit a working profile. `runner-profile.local.json` is ignored, and [`runner-profile.example.json`](runner-profile.example.json) contains placeholders only.

Schema version 1 defines:

- `sandbox.root` and `sandbox.projectDir`: paths visible inside the isolated run.
- `launcher`: the local isolation wrapper. Its argument list may use `{privateRoot}`, `{sandboxRoot}`, `{runnerCommand}`, `{runnerCwd}`, and the whole-argument `{runnerArgs}` expansion.
- `preflight`: a command that must succeed through the launcher before any cell runs.
- `runners`: named command entries. Arguments may use `{sandboxProject}` and `{taskFile}`; `stdin: "prompt"` sends the shared task prompt.
- `transcript`: a declarative adapter for each runner and judge. The shipped public adapter format is JSONL: `toolCalls` selects records with field-path matchers and extracts a command path; optional `recordsPath` iterates an array of calls inside each record. Optional `usage` paths select input and output token counts. The harness has no built-in knowledge of any agent CLI event schema.
- `judge`: the blind screenshot evaluator. Its arguments may use `{sandboxProject}` and `{schema}`; the prompt is available through stdin. Optional `resultPath` selects the score object from the judge's JSON or last JSONL record.
- `browserCommand`: the identical browser-helper syntax advertised to every runner.
- `audit.rules`: required or forbidden regular expressions over `stdout`, `stderr`, `combined`, or adapter-extracted tool `command` records.

Every audit rule is classified as:

- `strict`: a finding fails the cell and forces primary scores to zero.
- `adjusted`: a finding is reported but does not change the score.

Runner commands, executable paths, launcher flags, environment variables, transcript adapters, context expectations, limits, audit patterns, and version probes belong in the local profile. None are hard-coded in the harness. The profile path and inline profile variables are removed from every launcher, runner, judge, and version-probe child environment; agents receive only the task prompt, project, and configured browser-helper syntax.

The launcher owns OS-level isolation for runner and judge processes. It should expose only the private run root and required runtime assets, map the host project to `sandbox.projectDir`, keep sibling and host-user data inaccessible, and provide the browser helper named by `browserCommand`. Project preparation, builds, preview servers, browser evaluation, and evidence copying run host-side under a mode-`0700` private root; they do not run through the profile launcher. The harness runs the launcher preflight before any cell and records its receipt in the manifest.

## Static HTML

Select `static-html` with a local JSON file:

```json
{
  "description": "a build-less HTML project using published design-system assets",
  "stylesheets": ["https://cdn.example.com/design-system.css"],
  "scripts": ["https://cdn.example.com/design-system.js"],
  "htmlAttributes": {
    "data-theme": "neutral"
  },
  "starterBody": "  <main class=\"system-card\">Replace this starter.</main>",
  "cliTarballUrl": "https://cdn.example.com/design-system-cli.tgz",
  "agentDocsUrl": "https://cdn.example.com/agent-docs.txt"
}
```

Only `stylesheets` and `scripts` are needed. When `cliTarballUrl` is omitted, the project has no package install or agent CLI. When present, the CLI is installed locally and used to generate agent docs. `agentDocsUrl` appends public, delivery-specific guidance when configured.

```sh
VIBE_RUNNER_PROFILE=/absolute/path/to/runner-profile.json \
  pnpm -F @astryxdesign/vibe-tests delivery:run \
  --configs react-build,react-nobuild,static-html \
  --static-config /absolute/path/to/static-config.json \
  --runners runner-a,runner-b \
  --sample 15 \
  --seed 20261003 \
  --concurrency 1 \
  --resume
```

Concurrency defaults to 1 so local browser servers and launcher resources do not interfere. Every attempted cell writes `runs/<id>/run.json`. Successfully scored cells are reusable checkpoints. Setup failures before the agent runs, launcher-spawn failures, and harness-owned failures such as a browser launch error are retryable infrastructure failures that are excluded from score denominators. Failures caused by agent-authored output after the runner completes—including build or preview-script failures—are scored as failed cells and reused by `--resume`; `--max-new-jobs <n>` can stop after a checkpoint batch.

## React no-build starter

The no-build starter exercises an icon-bearing Banner, component hooks, theme context, and a controlled TextInput. Both the core and theme ESM imports include `?external=react,react-dom`, so the CDN modules reuse the import-mapped React runtime instead of creating a second instance. A real run renders and types into this starter before scheduling matrix cells.

## Evaluation and reporting

The shared evaluator:

1. runs `vite build` for `react-build` and records `tsc --noEmit` diagnostics as a non-gating quality metric;
2. serves the result and checks for a non-blank render, browser console errors, and page errors;
3. captures a full-page screenshot;
4. measures visible interactive targets — buttons, links, form controls, menus, tabs, and dialogs — and credits one only when its nearest component root is an Astryx component, so raw controls inside Card bodies, table cells, panels, and other content slots stay raw;
5. retains the former ancestor-credit adoption metric as `coarse` for longitudinal comparisons;
6. scans only runner-authored changes after removing comments, reporting CSS-variable fallback literals separately from hard-coded values and token/theme definitions;
7. runs axe-core;
8. asks the profile's blind judge to score prompt fulfillment and visual quality from an anonymized screenshot and the task prompt only.

A build failure, preview-script failure, page error, blank render, runner failure, timeout, or strict audit failure receives both adoption scores, prompt-fulfillment, and visual-quality scores of 0. Those scored rows remain in every median and pass-rate denominator. A timeout separately records the last complete on-disk state as **best before timeout** without changing the primary score. Failures the harness owns before evaluation can proceed are reported separately as infrastructure failures, contribute no score, and remain retryable checkpoints.

The blind judge prompt describes only the requested UI and visible scoring criteria. A judge process crash, nonzero exit, invalid result, or strict context-audit failure is retried once. Each attempt and error is recorded; if both attempts fail, judge scores remain null and the report marks the judge unavailable rather than assigning zero.

The output directory contains `report.md`, a self-contained `report.html`, `report.json`, screenshots, transcripts, per-run receipts, and a manifest. The manifest records the selected prompts, config hash, concurrency, time limits, profile schema version, runner limits, audit-rule counts, opaque transcript-adapter hashes, version receipts, and resumable completion state without copying the local profile.
