---
'@astryxdesign/cli': patch
---

[fix] Printed commands name the scoped `@astryxdesign/cli` package whenever the `astryx` bin is not installed for the project
@josephfarina

- A hint uses `npx astryx …` (or `pnpm exec`, `yarn`, `bunx`) only when the `astryx` bin is in `node_modules/.bin`, in the project or a folder above it. Otherwise it prints `npx @astryxdesign/cli …` (`pnpm dlx`, `yarn dlx`, `bunx`), as it already did when the CLI ran from an npx or dlx cache.
- A global install, or a workspace install used in a fresh package, used to print `npx astryx …`. The npm package named `astryx` is not this CLI, so following that hint fetched an unrelated package.
- `astryx blog` follows the same rule, and the incident console template names the scoped package.

Classification: contract-restoring. JSON shapes are unchanged; only hint text changes, and projects with the CLI installed keep `npx astryx …`.
