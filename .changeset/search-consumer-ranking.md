---
'@astryxdesign/cli': patch
---

[fix] Consumer queries find consumer docs first, not authoring content.

@josephfarina

Added a "Use integrations" guide (`use-integrations.doc.mjs`) that covers
discovering, installing, and using integration packages in an app. Search
now ranks it above authoring and API-function docs for consumer-phrased
queries like "add an integration" or "install a package". Authoring
queries like "build an integration" still rank authoring content first.
