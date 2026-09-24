---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate` now ends each warning about a misplaced contribution, a stray codemod file, a mis-named codemod folder, or a component source without a doc with the exact fix: the root to move a file under or the manifest line to add, the version folder a codemod belongs in, or the doc file to create. Codemod paths are shown relative to the package instead of as absolute paths.

@josephfarina
