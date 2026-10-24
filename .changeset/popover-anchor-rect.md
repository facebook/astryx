---
'@astryxdesign/core': patch
---

[feat] Popover: `anchorRect` anchors a popover its caller opens with `isOpen` on a rectangle in viewport coordinates, the shape `getBoundingClientRect()` returns, so it can open beside a list row, a link, a text selection or a point instead of a button. It moves when a new rectangle is passed, no element gets trigger ARIA, and focus returns on close to the element that had it. `PopoverAnchorRect` is the rectangle's type.

@vjeux
