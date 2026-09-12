---
'@astryxdesign/cli': patch
---

[fix] Component loader now reads default-export `.doc.mjs` files (the shape `integration add component` writes), fixing a crash where `component` and `search` could not load generated docs. Human `component` detail and list views now use the API-resolved import specifier instead of recomputing from core, so integration components report their package-authored import. `pack --check` now reports an error when a component doc cannot be loaded instead of silently approving.
@josephfarina
