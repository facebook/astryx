---
'@astryxdesign/cli': patch
---

[fix] Protect generated, vendored, ignored, linked, dependency, and out-of-root files from upgrade codemods using working-tree declarations. Upgrades now run declared regeneration hooks, recheck protected outputs, and report incomplete changes in human and JSON results.

@ejhammond
