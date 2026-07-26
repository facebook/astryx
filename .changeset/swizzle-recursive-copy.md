---
'@astryxdesign/cli': patch
---

[fix] swizzle now copies nested component source recursively (#3506). Previously only a component's top-level files were copied, so components split across subdirectories (e.g. `Table/plugins/*`) produced a broken partial eject — the copied entry still imported from the dropped subtree. Import rewriting is now location-aware, so intra-component imports from nested files stay relative while only imports that escape the component are mapped to the owner package's subpaths.
@oneshot2001
