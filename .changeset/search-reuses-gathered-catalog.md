---
'@astryxdesign/cli': patch
---

[fix] `search()` from `@astryxdesign/cli/api` answers faster when one process searches again: it reuses the components, docs, templates and themes it gathered for the same folder and `type`, until a package.json, Astryx config, lockfile or node_modules folder there or above changes, or five minutes pass. Results are unchanged; a one-shot `astryx search` works as before.

@josephfarina
