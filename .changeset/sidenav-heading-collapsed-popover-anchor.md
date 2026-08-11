---
'@astryxdesign/core': patch
---

[fix] SideNav: the collapsed icon-only `SideNavHeading` trigger with a `menu` no longer omits its popover's anchor. The trigger's ref callback wasn't forwarding to `usePopover`'s `triggerRef`, so the menu popover had no CSS anchor to position against and fell back to the viewport corner instead of opening next to the trigger.

@HelloOjasMutreja
