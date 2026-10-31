---
'@astryxdesign/core': patch
---

[feat] Tooltip and HoverCard: a tap on a trigger that sits inside a control goes to that control alone. On a touch screen, tapping a truncated `Link` followed the link and also opened the truncation tooltip, and tapping a truncated ID or a name avatar on a `ClickableCard` or a clickable list row opened the card and the tooltip at once, so one tap did two things and left a tooltip over whatever the control opened. With `touchTrigger="auto"` (the default), a tap now leaves the layer shut when the trigger performs an action or sits inside something that does: a link, a button, a label, an option or menu item, or a row or card made clickable with `useClickableContainer`. A truncated label in running text still opens its tooltip on a tap, `touchTrigger="tap"` still always opens, and mouse hover is unchanged. A disabled field or card takes no tap, so a tap on a disabled field still shows its `disabledMessage`.

@vjeux
