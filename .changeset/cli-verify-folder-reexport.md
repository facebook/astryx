---
'@astryxdesign/cli': patch
---

[fix] `integration verify` reads a package's exports with the same reader discovery uses, so the two agree: a component re-exported through a folder's index file passes, and a type-only re-export no longer counts as the component.

@josephfarina
