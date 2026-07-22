---
'@astryxdesign/core': patch
---

[fix] AppShell nav surfaces (TopNav / SideNav) now animate in instead of snapping (#4174)

Showing a nav surface used to pop in instantly — the surface previously had no
enter transition, so it appeared abruptly next to the MobileNav drawer, which
already slides. The TopNav header and inline SideNav now fade and slide in when
they appear, using the same motion language MobileNav uses
(`--duration-medium` / `--ease-standard`), so all shell nav motion is
coordinated. The animation is CSS-only (`@starting-style`), respects
`prefers-reduced-motion`, and adds no public API — nothing is unmounted or made
non-focusable to express state, so focus and tab order are unaffected.

@cixzhang
