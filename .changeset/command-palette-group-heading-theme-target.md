---
'@astryxdesign/core': patch
---

[feat] CommandPalette: add a dedicated `astryx-command-palette-group-heading` theme target on the group heading, so consumers can theme just the heading (e.g. its padding or typography) via `defineTheme` instead of a fragile structural selector. The group root keeps its own `astryx-command-palette-group` target.

@freddymeta
