---
'@astryxdesign/cli': patch
---

[feat] From 0.7.3, `doctor integration validate` (and so `integration check`) lists each Astryx command a topic writes with a package runner as a `runner_command` note in `data.notes`, with its file, line and the bare `astryx <command>` to write. A note fails nothing, so `integration check --strict` exits as before. The unscoped name after a download runner (`npx astryx`) always counts, because it fetches an unrelated package; the scoped `npx @astryxdesign/cli`, for install steps, does not.
@josephfarina
