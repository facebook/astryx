---
'@astryxdesign/core': patch
---

[fix] `CommandPaletteItem` now reflects its highlighted, selected, and disabled states on the `command-palette-item` theme target as `data-highlighted="highlighted"`, `data-selected="selected"`, and `data-disabled="disabled"`. A theme can now style the active keyboard result, the chosen value, or an unavailable command, for example `.astryx-command-palette-item[data-selected]`. States derived from CommandPalette are reflected too. Rendering, semantics, and props are unchanged. (#7967)

@cixzhang
