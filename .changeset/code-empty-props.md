---
'@astryxdesign/core': patch
---

[fix] Code and CommandPaletteEmpty now forward props correctly (#3620)

`Code` spreads rest props (`aria-*`, `role`, event handlers) onto the DOM element. `CommandPaletteEmpty` applies the `xstyle`/`className`/`style` escape hatches and theme props.

@cixzhang
