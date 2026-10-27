---
'@astryxdesign/core': patch
---

[fix] `Overlay` and `DropdownMenuGroup` now forward host attributes and DOM handlers (`id`, `data-*`, `aria-*`, event handlers) to their root element, as other DOM-owning components do. Before, each accepted only `xstyle`, `className`, `style` and `ref` and dropped everything else, so a test id or analytics attribute passed to either never reached the page. `Overlay`'s touch toggle still runs on every tap, and a caller `onClick` or `onMouseUp` runs after it. `DropdownMenuGroup` keeps its `role="group"` and, while it has a `title`, keeps that title as its name.

@kentonquatman
