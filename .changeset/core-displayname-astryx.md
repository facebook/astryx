---
'@astryxdesign/core': patch
---

[fix] Rebrand the core package `displayName` from "XDS Core" to "Astryx Core"

The core package's `displayName` still read "XDS Core". It surfaces in the docsite package sidebar and landing cards as the friendly package label, so this rebrands it to "Astryx Core" to match the Astryx migration. Metadata-only — the package `name` and public API are unchanged.
@ejhammond
