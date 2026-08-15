---
'@astryxdesign/core': patch
---

[fix] `context-menu` component overrides now drive the menu's internal radius and padding vars. `ContextMenu.doc.mjs` has always documented `derived` entries mapping `borderRadius` → `--_dropdown-menu-radius` and `padding` → `--_dropdown-menu-padding`, but `derivedVarRegistry` had no `context-menu` key, so the mapping was dead: `components: {'context-menu': {base: {borderRadius: '12px'}}}` emitted `border-radius` alone and the menu kept reading its own `var(--_dropdown-menu-radius)`. The registry entry now matches the doc, as it already does for `dropdown-menu` (#4783).

@cixzhang
