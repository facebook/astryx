# Delivery-mode vibe tests

This harness compares Astryx across three public consumer delivery modes while holding the prompt battery, agents, and evaluator constant:

- `react-build`: Vite, React 19, npm packages, and generated agent docs.
- `react-nobuild`: one `index.html` using React 19, htm, and Astryx 0.6.5 from public CDNs.
- `vanilla`: build-less HTML with the commit-pinned Vanilla Astryx assets, a minimal working starter, and a locally installed preview CLI.

Each matrix cell starts a context-free agent in a unique private root. Generated source, transcripts, screenshots, and reports are never written to tracked paths.

## Run

The Linux host must support passwordless `sudo` for mount namespaces. This is required for run isolation; the harness fails closed when it is unavailable.

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run \
  --configs react-build,react-nobuild,vanilla \
  --agents claude,muse \
  --sample 3
```

Before running agents, the harness renders the no-build React starter at the pinned package version and saves its screenshot. The starter exercises an icon-bearing Banner, component hooks, theme context, and a controlled TextInput. Both the core and theme ESM imports carry `?external=react,react-dom` so esm.sh reuses the import-mapped React runtime.

The published 0.6.5 reference recipe externalized React only on the core import. Its theme import could therefore resolve a second React instance, causing hook/context failures that looked like agent or delivery-mode failures. The corrected harness starter externalizes React on **both** imports and treats its self-check as a prerequisite.

The shared evaluator then:

1. runs `vite build` for `react-build` and separately records `tsc --noEmit` diagnostics as a non-gating quality metric;
2. serves the output and checks for a non-blank render, browser console errors, and page errors;
3. captures a full-page screenshot;
4. measures visible semantic targets only, excluding hidden/inactive UI and excluding layout/container-root credit;
5. scans only agent-authored changes for inline styles, raw hex values, and raw pixel values (custom-property-only inline styles do not count);
6. runs axe-core;
7. asks a headless Claude judge to score prompt fulfillment and visual quality from an anonymized screenshot and the task prompt only.

A build failure, page error, blank render, runner failure, timeout, or forbidden-context audit failure receives adoption, prompt-fulfillment, and visual-quality scores of 0. Those rows remain in every median and pass-rate denominator. Reports display the sample count for each metric.

The output directory contains `report.md`, a self-contained `report.html`, `report.json`, screenshots, runner transcripts, and per-run receipts. The manifest records runner versions, concurrency, wall-clock limits, and Muse's 80-model-step cap. Wall time is a secondary metric because Muse has a step cap while Claude has only the shared wall-clock timeout.

## Isolation and context audit

Every agent and judge runs in its own mode-`0700` root with a unique project, `HOME`, configuration directory, and `TMPDIR`. A private mount namespace hides the host home directory and replaces `/tmp`; sibling-run paths therefore do not exist from inside the run. Shared results are copied out only after the agent and evaluator finish, and shared output paths are outside every agent-readable namespace. The blind judge gets a separate root containing only its screenshot.

The isolated `PATH` is `/mnt/run/bin:/usr/bin:/bin`, with only Node and Git added to the private bin. The `meta` CLI is absent.

- Claude runs in safe mode with strict empty MCP configuration, no session persistence, no slash commands, and an explicit tool allowlist. Its init event must report no MCP servers, external plugins, or hooks. A host wrapper may print plugin-install attempts before Claude starts; the private `PATH` blocks the installer, and the init-event audit—not wrapper intent—proves that nothing loaded.
- Muse runs the same `native-basic` preset for every config with plugins gated off, foreign personal context disabled, web tools disabled, no session log, and `--disable-muse-llm-rules`. Muse still emits built-in skill and final-verification reminder lifecycle records; this is reported as a runner-wide asymmetry, with no external skill content loaded. Any external plugin install or MCP event fails the run.

## Fairness review

Print generated task prompts without installing packages or starting agents:

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run --sample 3 --dry-run
```

The task text and output contract are shared. Only the factual delivery-environment description and required output filename differ. `expectedComponents` and path-selection coaching are never included.

Vanilla's generated `AGENTS.md` is intentionally HTML-only: pinned page setup, templates, components, rules, and use of the locally installed CLI through `npx astryx`. It contains no React path, source-clone fallback, or global-install instructions.

## Pins

Override delivery inputs for a later branch snapshot without editing the harness:

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run \
  --vanilla-cdn-ref <commit> \
  --vanilla-tarball-url <public-tarball-url> \
  --react-version <published-version>
```

The defaults match the pins documented by this branch's Vanilla Astryx `llms.txt`.
