---
'@astryxdesign/core': patch
---

[fix] SideNav: remove the square inner border on collapsed items' child-menu popover; its 0-radius corners cut across the Popover surface's own 12px-radius arcs instead of nesting inside them, and the surface's shadow now defines the edge on its own, matching every other popover in the system
@HelloOjasMutreja
