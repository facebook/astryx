---
'@astryxdesign/core': patch
---

[fix] In a collapsed SideNav, pressing a SideNavHeading menu trigger right after hovering it now keeps the hover-opened menu open, as the click guard intends. The browser was dismissing the menu on the press because the trigger sat outside the panel; the collapsed trigger is now the panel's native invoker, the same wiring TopNavMenu uses.

@cixzhang
