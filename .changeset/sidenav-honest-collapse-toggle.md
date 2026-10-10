---
'@astryxdesign/core': patch
---

[fix] SideNav: toggling a nav that cannot collapse through the deprecated `handleRef` (for example from an outside `SideNavCollapseButton`) no longer leaves `getCollapseState()` reporting a collapse that never happened.

@AKnassa
