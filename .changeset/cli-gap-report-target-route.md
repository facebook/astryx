---
'@astryxdesign/cli': patch
---

[feat] `astryx gap-report` now also sends a report about an integration to that integration's own `issuesUrl` when report handlers are loaded, so a package's tracker is no longer skipped whenever any handler exists. A GitHub URL still needs `--confirm-public`. The route is skipped for Core, when the integration's own handler ran, and when a handler already filed the report inside that URL.

@josephfarina
