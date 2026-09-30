---
'@astryxdesign/cli': patch
---

[fix] `astryx integration verify` resolves every public import in the packed package, not in your source folder.

Before, its temporary app resolved your package's own name through the source `package.json`, so an `exports` target left out of the tarball still passed. It now fails with `component_export_missing`, as an app that installs the tarball would.

@josephfarina
