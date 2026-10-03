# Delivery-mode vibe tests

This harness compares Astryx across three public consumer delivery modes while holding the prompt battery, agents, and evaluator constant:

- `react-build`: Vite, React 19, npm packages, and generated agent docs.
- `react-nobuild`: one `index.html` using React 19, htm, and Astryx 0.6.5 from public CDNs.
- `vanilla`: build-less HTML with the commit-pinned Vanilla Astryx assets and preview CLI.

Each matrix cell starts a fresh agent process in a fresh project outside the source checkout. Generated source, transcripts, screenshots, and reports are never written to tracked paths.

## Run

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run \
  --configs react-build,react-nobuild,vanilla \
  --agents claude,muse \
  --sample 3
```

Before running agents, the harness renders the no-build React starter at the pinned package version and saves its screenshot. The shared evaluator then:

1. builds or serves the output;
2. checks for a non-blank render and browser console errors;
3. captures a full-page screenshot;
4. measures Astryx-class adoption with the same DOM rule for every mode;
5. counts inline styles, raw hex values, and raw pixel values with the same source rule;
6. runs axe-core;
7. asks a headless Claude judge to score prompt fulfillment and visual quality from an anonymized screenshot and the task prompt only.

The output directory contains `report.md`, a self-contained `report.html`, `report.json`, screenshots, runner transcripts, and per-run receipts.

## Fairness review

Print generated task prompts without installing packages or starting agents:

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run --sample 1 --dry-run
```

The task text and output contract are shared. Only the delivery-environment description and required output filename differ. `expectedComponents` is never included.

## Pins

Override delivery inputs for a later branch snapshot without editing the harness:

```sh
pnpm -F @astryxdesign/vibe-tests delivery:run \
  --vanilla-cdn-ref <commit> \
  --vanilla-tarball-url <public-tarball-url> \
  --react-version <published-version>
```

The defaults match the pins documented by this branch's Vanilla Astryx `llms.txt`.
