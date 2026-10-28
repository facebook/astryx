---
'@astryxdesign/core': patch
---

[fix] `Overlay`, `DropdownMenuGroup` and `MobileNavToggle` now forward host attributes and DOM handlers (`id`, `data-*`, `aria-*`, event handlers) to the element each one owns, as other DOM-owning components do. Before, each accepted only `xstyle`, `className`, `style` and `ref` (plus `data-testid` on `MobileNavToggle`) and dropped everything else, so a test id or analytics attribute passed to any of them never reached the page. Built-in behavior stays component-owned: `Overlay`'s touch toggle and `MobileNavToggle`'s drawer toggle run on every press, before a caller handler; `DropdownMenuGroup` keeps its `role="group"` and, while it has a `title`, keeps that title as its name; `MobileNavToggle` keeps its `aria-expanded` and `aria-controls`.

@kentonquatman
