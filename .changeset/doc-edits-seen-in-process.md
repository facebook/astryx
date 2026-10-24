---
'@astryxdesign/cli': patch
---

[fix] A process that calls the CLI API more than once, such as a docs site's search or an agent harness, now sees an edit to a doc file it already read: `search()`, `docs()` and `component()` read the edited file's new content on their next call, instead of what the process first imported. An unchanged doc file is still imported once and shared, so readers keep getting the module's own doc.

@josephfarina
