---
'@astryxdesign/cli': patch
---

[fix] `astryx manifest --json` now takes each command's examples from its CommandDoc and its response types from the API function it wraps, so no example differs from the documented one and `upgrade` lists `upgrade.registry`, which `upgrade --registry --json` already emits.

@josephfarina
