---
'@astryxdesign/core': patch
---

[fix] Layer/Popover: anchor-positioned popovers now mirror in RTL. `placement`/`alignment` `start`/`end` are logical (inline-start/inline-end), so DropdownMenu, Selector, Typeahead, date inputs, and every other context-mode popover opens toward the correct side under RTL automatically via CSS. LTR behavior is unchanged (#3389).
@AKnassa
