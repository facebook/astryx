---
'@astryxdesign/cli': patch
---

[feat] `doctor integration docs` lists each Astryx command a topic writes with a package runner, in the new `runnerCommands` field, with its line and the bare `astryx <command>` to write. The list is information only: no check warns or fails on it, so `integration check --strict` exits as before. The unscoped name after a download runner (`npx astryx`) always counts, because it fetches an unrelated package; the scoped `npx @astryxdesign/cli`, for install steps, does not.
@josephfarina
