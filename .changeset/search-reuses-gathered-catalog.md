---
'@astryxdesign/cli': patch
---

[fix] `search()` from `@astryxdesign/cli/api` answers faster when one process searches again: it reuses the components, docs, templates and themes it gathered for the same folder and `type` while no file it read, and no folder it listed, has changed since (a linked workspace package included). To see those reads, the first such search in a process wraps `node:fs`'s read functions for that process; outside a search they behave exactly as before. Results are unchanged. Short-lived runs are unaffected: each `astryx search` command gathers once, as before. Introduced in [#7830](https://github.com/facebook/astryx/pull/7830); final-state evidence: [#7885](https://github.com/facebook/astryx/pull/7885).

@josephfarina
