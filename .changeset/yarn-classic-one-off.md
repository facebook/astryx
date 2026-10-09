---
'@astryxdesign/cli': patch
---

[fix] One-off commands in a classic Yarn (1.x) project use `npx @astryxdesign/cli …` instead of `yarn dlx`, which classic Yarn does not have
@josephfarina

- Whenever the CLI prints its scoped one-off form (it ran from an npx or dlx cache, or the `astryx` bin is not installed for the project), a Yarn project got `yarn dlx @astryxdesign/cli …`. On classic Yarn that command fails.
- Classic Yarn is read from the declared `packageManager` version, the `yarn.lock` header (`# yarn lockfile v1`), a committed `.yarnrc` (without `.yarnrc.yml`), or the runner. Yarn 2 and later keep `yarn dlx`.

Classification: contract-restoring. JSON shapes are unchanged; only hint text changes.
