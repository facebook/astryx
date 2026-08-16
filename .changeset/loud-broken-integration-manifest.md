---
'@astryxdesign/cli': patch
---

[fix] An integration whose manifest fails to load is no longer silent. A manifest that throws on import — the common case being one still calling a `create*` authoring factory, removed in 0.3.0 — contributes nothing, and the CLI treated that as if the package had never been configured: `astryx discover` answered `No integrations configured.` while `astryx.config.mjs` plainly configured one, and no command said a word. The only way to find out was to already suspect it and run `validate-integration` by name. Meta's internal `@nest/xds-meta` sat invisible to CLI discovery for a week that way, and the app team's conclusion was that the components did not exist.

The load error now counts as an integration issue, so the existing one-line stderr nudge fires on `component`, `template` and `upgrade`, and `discover` — the command whose whole job is listing integrations — nudges too. `discover` also stops reporting `configured: false` for a project that configured an integration that failed to load; the empty state now distinguishes "you configured nothing" from "what you configured contributed nothing", which is the distinction `meta.configured` was introduced to carry.

Nothing becomes fatal: the warning is best-effort, stderr-only, suppressed under `--json`, and never changes an exit code. Broken contributions are still skipped exactly as before.

@cixzhang
