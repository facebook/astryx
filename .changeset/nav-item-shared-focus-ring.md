---
'@astryxdesign/core': patch
---

[fix] Nav items draw the system focus ring instead of the browser's. `SideNavItem`, `SideNavHeading`, and the drawer modes of `TopNavMenu`, `TopNavMegaMenu` and `TopNavMegaMenuItem` now compose the shared focus outline from `utils/focusOutline.stylex` (#4654), so a keyboard-focused nav row is ringed with `2px solid var(--color-accent)` at the documented `3px` offset in every theme, matching `Button`, `TabList`, `Link` and `TopNavItem`. Previously these surfaces styled no focus state at all and fell back to the user agent's `outline: auto 1px`, which is theme-independent — measured `rgb(0, 95, 204)` in light and `rgb(153, 200, 255)` in dark whatever the theme said. In the split-action row (a collapsible item that also has an `href`) the ring goes on the link and the chevron toggle individually, since they are separate tab stops; the row wrapper stays unringed so only the focused control is outlined.

@cixzhang
