---
'@astryxdesign/cli': patch
---

[feat] An integration manifest can name where its docs live with the optional `docsiteUrl` field (an https or http URL). `astryx discover` shows it for a package the project has, in the list and package page, text and JSON. An invalid value is left out and `astryx doctor integration validate` warns with `invalid_docsite_url`; the rest of the manifest still loads.

@josephfarina
