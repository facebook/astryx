---
'@astryxdesign/core': patch
---

[fix] SideNavItem no longer overwrites a consumer-supplied `aria-label` with the visible `label` text in collapsed mode (icon-only link/button and popover-trigger paths), so attention/context conveyed only through `aria-label` survives collapse. (#5641)

@HelloOjasMutreja
