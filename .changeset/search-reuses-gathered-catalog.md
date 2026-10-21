---
'@astryxdesign/cli': patch
---

[fix] `search()` from `@astryxdesign/cli/api` answers faster when one process searches again: it reuses the components, docs, templates and themes it gathered for the same folder and `type` while no file it read, and no folder it listed, has changed since (a linked workspace package included). Results are unchanged. Short-lived runs are unaffected: each `astryx search` command gathers once, as before.

@josephfarina
