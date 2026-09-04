---
'@astryxdesign/cli': patch
---

[fix] A manifest key this CLI does not know no longer discards the whole integration. `astryx.integration.*` was parsed with a strict schema, so one unrecognized field failed the parse — and an integration whose manifest fails to parse contributes _nothing_, taking its components, templates and codemods down with it. Since an integration is published once and installed against many CLI versions, a field added by a newer CLI reached every older consumer as total, silent loss of that package (#5119). Unknown fields are now ignored with an `unknown_manifest_key` warning naming them, and the rest of the manifest still applies; a _known_ field of the wrong type is still an error. (#5311 follow-up)

@josephfarina
