---
'@astryxdesign/core': patch
---

[perf] useLayer: placing a context layer no longer re-renders its host. The hook still resolves where the layer goes from its inert marker once the marker is in the DOM, but it now hands that mount to an internal slot that renders the marker and the layer, so the second render on mount is the slot's alone: a Tooltip, Popover, DropdownMenu, Selector or ComplexSelector and everything under it render once when they mount closed. The DOM, server markup, hydration and `lazyMount` are unchanged.

@vjeux
