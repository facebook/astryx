---
'@astryxdesign/cli': patch
---

[fix] CLI: a stray lockfile no longer overrides the `packageManager` your project declares.

@cixzhang

One `yarn install` inside a pnpm project leaves a `yarn.lock` behind forever. A single lockfile used to outrank the `packageManager` field, so the CLI answered "yarn" for a project that says pnpm — and printed `yarn astryx …` in every command it suggested, including the invocation line written into agent docs, where agents copy it. `astryx doctor` called that setup healthy.

The declared `packageManager` field now decides, whatever lockfiles sit beside it. The documented fallbacks are unchanged: with nothing declared, a single lockfile still answers, a committed `pnpm-workspace.yaml` / `.yarnrc.yml` / `bunfig.toml` still breaks a multi-lockfile tie, an unbroken tie still resolves to the neutral `npx` form with a doctor FAIL, and the runner is still consulted only when the whole walk found nothing.

`astryx doctor` now WARNs when a lockfile contradicts the declaration, names the file, and says what to delete — instead of reporting the project as fine.
