---
'@astryxdesign/core': patch
---

[feature] On a compact touch screen (a phone, iOS or Android), DropdownMenu's `presentation="bottom-sheet"` with plain actions presents the way iOS 26 presents an action sheet: a centered, alert-style card that scales down from 1.2 and fades in with its dimming on the alert's spring, holds the actions and Cancel in one stack, tracks a finger across the actions as one group (the lift runs the action under it), and dismisses with a fade, on Cancel, Escape or a tap outside, returning focus to the trigger. A menu with sub-menus, links, rich labels, descriptions, end content, rows that stay open, a header or a footer keeps the bottom sheet, as do larger screens and mouse presentations.

@vjeux
