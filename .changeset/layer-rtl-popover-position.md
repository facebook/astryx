---
'@astryxdesign/core': patch
---

[fix] Layer/Popover: anchor-positioned popovers now mirror in RTL. `placement`/`alignment` `start`/`end` are logical — resolved against the trigger's computed direction at open time — so DropdownMenu, Selector, Typeahead, date inputs, and every other context-mode popover opens toward the correct side under RTL. LTR output is unchanged (#3389).
@AKnassa
