---
'@astryxdesign/core': patch
---

[fix] `DropdownMenuDivider` now forwards host attributes and DOM handlers (`id`, `data-*`, `aria-*`, event handlers) to its separator, as other DOM-owning components do. Before, it accepted only `xstyle`, `className`, `style` and `ref` and dropped everything else, so a separator could not carry a test id or an accessible label. Its `role="separator"` and orientation stay component-owned.

@cixzhang
