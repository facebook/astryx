---
'@astryxdesign/core': patch
---

[fix] Layer/Popover: anchor-positioned popovers now mirror in RTL contexts. `placement`/`alignment` start/end are logical — resolved against the trigger's computed direction (CSS `direction` property or `dir` attribute) at open time — so DropdownMenu, MoreMenu, Selector, Typeahead, date inputs, and every other context-mode popover open toward the correct side under RTL instead of the physically-LTR side. An explicit `justify-self` is emitted in RTL to guard against engines that mis-resolve position-area's implied alignment via the popover's inherited direction (the "menu far from control" displacement in #3389). LTR output is byte-identical (#3389).
@AKnassa
