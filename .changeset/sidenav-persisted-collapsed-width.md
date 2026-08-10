---
'@astryxdesign/core': patch
---

[fix] SideNav: a collapsed `resizable` nav with `resizable.autoSaveId` no longer renders invisible (0px, expanded layout) after a reload. `useResizable` correctly seeds its own `isCollapsed` as `true` when it restores a persisted width of `0`, but `SideNav`'s own uncontrolled collapsed state is a separate hook with no way to see that at initialization — left unreconciled, the nav rendered in expanded layout with its width forced to `0` instead of the compact icon rail. A mount-only effect now reconciles the two.

@HelloOjasMutreja
