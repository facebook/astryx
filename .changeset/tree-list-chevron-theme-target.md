---
'@astryxdesign/core': patch
---

[feat] TreeList: add a dedicated `astryx-tree-list-chevron` theme target for the expand/collapse toggle, so consumers can theme the chevron (color, per open/closed state) via `defineTheme` instead of reaching it through the functional `[data-tree-toggle]` attribute. Reflects the open/closed state as a `data-state` attribute (`expanded`/`collapsed`); the functional `data-tree-toggle` hook is unchanged.

@freddymeta
