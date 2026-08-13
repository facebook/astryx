---
'@astryxdesign/core': patch
---

[fix] AppShell: the mobile top bar rendered for a sidenav-only layout is now a `banner` landmark, matching the header region of a layout that has a `topNav`. Previously the page's landmark structure changed depending on which nav slots it filled: a screen-reader user on a small viewport got no banner region at all. When a `banner` slot is present the existing header keeps the role, so there is still exactly one.

@cixzhang
