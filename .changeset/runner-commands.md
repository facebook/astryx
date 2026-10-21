---
'@astryxdesign/cli': patch
---

[feat] `doctor integration docs` lists each Astryx command a topic writes with a package runner, in the new `runnerCommands` field, as a `runner_command` warning with its line and the bare `astryx <command>` to write. `integration check --strict` fails on it; `doctor integration docs` still exits 0. The unscoped name after a download runner (`npx astryx`) always counts, because it fetches an unrelated package; the scoped `npx @astryxdesign/cli`, for install steps, does not.
@josephfarina
