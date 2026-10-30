---
'@astryxdesign/core': patch
---

[fix] `Overlay`, `DropdownMenuGroup` and `MobileNavToggle` now forward host attributes and DOM handlers (`id`, `data-*`, `aria-*`, event handlers) to the element each one owns, as other DOM-owning components do. Before, `Overlay` and `DropdownMenuGroup` accepted only `xstyle`, `className`, `style` and `ref` and dropped everything else, so a test id or analytics attribute on either never reached the page; `MobileNavToggle` also forwarded `data-testid`, but no other `data-*`, `id`, `aria-*` or handler. Built-in behavior stays component-owned: `Overlay`'s touch toggle and `MobileNavToggle`'s drawer toggle run on every press, before a caller handler; `DropdownMenuGroup` keeps its `role="group"` and, while it has a `title`, keeps that title as its name; `MobileNavToggle` keeps its `aria-expanded` and `aria-controls`.

@kentonquatman
