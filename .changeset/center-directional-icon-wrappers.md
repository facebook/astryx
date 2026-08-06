---
'@astryxdesign/core': patch
---

[fix] Center directional SVGs inside icon controls by normalizing the shared RTL mirror wrapper to `inline-flex`. This fixes the SideNav collapse button and the same baseline-sensitive wrapper used by gallery, tree, and table disclosure controls without changing their RTL mirroring behavior.
@andrewjp
