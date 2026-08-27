---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] `<Icon icon>`, `useIcon`, and `defineTheme({icons})` accept namespaced extension keys (`'numberInput:stepperDown'`, `'richtext:bold'`) alongside the built-in semantic names. A glyph owned by one component or library can now be themed by key while keeping `size`, `color` and `xstyle`, without widening the shared `IconName` union — and so without adding a required key to every downstream `IconRegistry`. Misspelled built-in names are still rejected, and `getIconRegistry()` still returns built-in names only.

@cixzhang
