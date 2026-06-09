---
'@xds/cli': patch
---

**CLI exit-code policy**: every user-visible error now exits with code 1 in both human and `--json` modes. Previously several command-layer errors printed a message but exited 0 — invisible to CI scripts and AI agents that gate on the exit code.

Affected paths now exit 1: `xds bogus-cmd`, `xds theme bogus-subcommand`, the bare `theme` parent group when given an unknown subcommand, and any "command not found"/"did you mean…" suggestion path. `--json` and non-`--json` invocations of the same error case now agree on the exit code.

Help, version, and bare-list invocations still exit 0. Introduces `lib/cli-error.mjs` as the single helper for emitting CLI errors — its doc-block is the canonical exit-code policy.
