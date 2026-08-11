---
'@astryxdesign/core': patch
---

[fix] SideNav: an audit pass over the family. `SideNavItem` now captures and forwards `...rest` to the control it renders, so `data-*`, `aria-*` and other pass-throughs reach the DOM instead of being dropped; it also exposes its disabled state as a theming state (`data-disabled`) alongside `size` and `selected`. A `SideNavCollapseButton` placed outside the sidenav via `handleRef` now subscribes to the collapse state rather than reading it from the ref during render, so its chevron and label stay in step after a toggle — `SideNavImperativeCollapseHandle` gains an optional `subscribe(listener)`. In drawer mode, `xstyle`/`className`/`style` and unrecognized props now reach the drawer instead of being discarded. The three chevron/expand transitions collapse to `0s` under `prefers-reduced-motion: reduce`, the collapsed submenu's accessible name comes from the string catalog (`@astryx.sideNavItem.submenuLabel`) instead of an English concatenation, `SideNavSection`'s hidden header composes `VisuallyHidden` instead of a hand-rolled clip block, and the collapsed item's hover-intent timers are cleared on unmount.

@cixzhang
