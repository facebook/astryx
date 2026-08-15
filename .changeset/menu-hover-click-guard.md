---
'@astryxdesign/core': patch
---

[fix] Menus that open on hover no longer close when you click them. A hover-opened menu is already open under the cursor by the time the pointer arrives, so the click that naturally follows was dismissing it — fixed for TopNavMegaMenu in #4555, and now shared: the hover→click guard lives in `useMenuHover`, so TopNavMenu, TopNavHeading, SideNavHeading and DropdownMenuSubMenu get it too, and TopNavMegaMenu runs on the shared machine instead of its own copy. Also from the consolidation: opening a menu moves focus into it synchronously rather than a frame later, closing one returns focus to its trigger instead of dropping it to the document, and keyboard activation always opens rather than toggling an open menu shut (#3121)

@cixzhang
