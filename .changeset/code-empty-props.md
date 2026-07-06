---
'@astryxdesign/core': patch
---

Fix Code and CommandPaletteEmpty prop forwarding. Code now spreads rest props (aria-*, role, event handlers) onto the DOM element. CommandPaletteEmpty now applies xstyle/className/style escape hatches and themeProps.
