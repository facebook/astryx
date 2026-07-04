---
'@astryxdesign/core': patch
---

[fix] Tooltip: satisfy WCAG 1.4.13 (Content on Hover or Focus). Tooltips can now be dismissed with `Escape` while visible, and stay open when the pointer moves from the trigger onto the tooltip surface (a short hover bridge). `useLayer` context render props gain `onMouseEnter`/`onMouseLeave` on the layer container to support hoverable overlays.
@cixzhang
