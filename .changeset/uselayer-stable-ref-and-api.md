---
'@astryxdesign/core': patch
---

[fix] `useLayer({mode: 'context'})` now returns a stable trigger ref callback and a stable API object when nothing exposed by it has changed. Previously the trigger ref was recreated on every render, so React detached and reattached an unchanged trigger element (removing and reapplying its CSS anchor name for no reason), and the returned object (both `context` and `fixed` modes) was rebuilt every render, defeating memoization in consumers like Carousel, ContextMenu, Popover, Tooltip, HoverCard, and BaseTypeahead.

@nynexman4464

@HelloOjasMutreja
