---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `astryx theme build --family <base> <children...>` builds a base theme and the themes that `extends` it as one unit: the base stylesheet restates the shared declarations once, scoped to every member (token block at zero specificity via `:where(:scope)`), and each member stylesheet carries only its own deltas — instead of every member restating the whole resolved token set. `defineTheme` records the resolved base as `__extends` to make the relationship visible to the build. Standalone and batch builds are unchanged.

@bmaurer
