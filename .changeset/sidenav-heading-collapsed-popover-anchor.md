---
'@astryxdesign/core': patch
---

[fix] SideNavHeading: the menu popover now anchors to the collapsed icon-only trigger instead of appearing at the top-left of the viewport. The collapsed trigger ref was missing the popover's `triggerRef`, so no `anchor-name` was written for the popover's CSS anchor positioning to resolve against.

@AKnassa
