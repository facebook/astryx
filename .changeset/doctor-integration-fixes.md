---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate` now ends each finding about a misplaced contribution, a stray codemod file, a mis-named codemod folder, a component doc without its source, or a component source without a doc with a fix that works when followed as written: where to move the file and the manifest line to add, the version folder a codemod belongs in, or the file to add. Codemod files are named by their path inside the package instead of an absolute path. A hidden component doc no longer draws the missing-doc warning, and a codemods root at the package root no longer reports the manifest as a stray codemod.

@josephfarina
