---
'@astryxdesign/core': patch
---

[fix] SideNav: a collapsed `resizable` nav with `resizable.autoSaveId` no longer renders invisible (0px, expanded layout) after a reload. `useResizable` correctly seeds its own `isCollapsed` as `true` when it restores a persisted width of `0`, but `SideNav` tracked its own, separately-initialized collapsed state instead of reading `useResizable`'s — left unreconciled, the nav rendered in expanded layout with its width forced to `0` instead of the compact icon rail. When resizable and uncontrolled, `SideNav` now derives its collapsed state directly from the resize hook instead of duplicating it.

@HelloOjasMutreja
