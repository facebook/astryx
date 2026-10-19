---
'@astryxdesign/cli': patch
---

[feat] An integration manifest can name where its docs live with the optional `docsiteUrl` field (an https or http URL), and where its feedback goes with the optional `feedback: {destination}` field (an opaque namespace or URL the CLI passes through). `astryx discover` shows both for a package the project has, in the list and package page, text and JSON. An invalid value is left out and `astryx doctor integration validate` warns with `invalid_docsite_url` or `invalid_feedback`; the rest of the manifest still loads.

@josephfarina
