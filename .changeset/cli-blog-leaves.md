---
'@astryxdesign/cli': patch
---

[refactor] CLI: blog reorganized into api/blog leaf shape — list/detail leaves projecting a shared RSS adapter (`_adapter.mjs` owns all network fetch + feed parsing), with `blog.mjs` kept as a dispatcher+barrel so the same `blog` export, the CLI wrapper, api/index.mjs, and the --json/human output stay byte-identical.
@josephfarina
