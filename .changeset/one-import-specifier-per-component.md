---
'@astryxdesign/cli': patch
---

[fix] `component` and `search` now report the same import specifier for an integration component, resolved once in `foundation/discovery/component-discovery.mjs`. `search` previously returned the bare package name, which does not resolve for a package whose components are exported behind subpaths.
@josephfarina
