---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor` no longer reports an integration it could not check as absent or complete (#6619)

- An installed dependency whose `astryx.integration.*` manifest cannot be loaded is still kept out of the loaded set, but `implicit-integrations` now names it and says it contributes nothing. Before, doctor said that no installed dependency ships a manifest. The check stays informational, and `astryx doctor integration validate <package>` gives the details.
- `implicit-integrations` lists only the roots that exist on disk. A package whose declared roots are missing is reported as contributing nothing, with the missing roots named. Before, it listed every root the manifest declared.
- `provider-identity` says how many loaded integrations it could not read, instead of counting only the readable ones.

@josephfarina
