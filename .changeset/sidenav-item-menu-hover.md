---
'@astryxdesign/core': patch
---

[fix] SideNav: a collapsed `SideNavItem` with children now opens its submenu flyout through the shared `useMenuHover` hook instead of its own hover timers, which changes three things about hover on that flyout. Hover is gated on `(hover: hover)`, so a touch tap no longer schedules a hover-open on a device that cannot hover — the tap opens the flyout through click, as before. `mouseleave` now only closes a flyout that hover opened: one opened by clicking stays open until it is dismissed, so the pointer can leave and come back. And clicking a collapsed item to dismiss its flyout no longer lets it spring straight back open under the stationary pointer. The 150 ms open / 200 ms close hover-intent delays are unchanged, as is keyboard behaviour — the flyout remains a focus-trapped dialog with Escape dismissal and focus restore.

@cixzhang
