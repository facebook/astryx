---
'@astryxdesign/core': patch
---

[fix] Tooltip and HoverCard: add ARIA roles to the floating layers — `role="tooltip"` on Tooltip (completing the ARIA tooltip pattern; the trigger already links via `aria-describedby`) and `role="dialog"` on HoverCard. Plumbed via a new optional `role` on the layer render props. (#3240; Popover already exposes `role="dialog"`.)
@durvesh1992
