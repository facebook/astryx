---
'@astryxdesign/core': patch
---

[fix] Floating layers now declare their own body type instead of inheriting it. The layer container already set `font-family`; it now sets `font-size` and `line-height` from `--text-body-size` / `--text-body-leading` alongside it. A layer is hosted wherever its trigger sits, so any content that did not set its own size took the ambient one — the same Tooltip, Popover or HoverCard rendered at 13px from a caption and at 20px from a lede. Content that goes through `Text`, or sets a size itself (Tooltip's label, DropdownMenu items, NavMenu headings), is unaffected: those already declared their own and still win. Anything that was relying on inheriting a non-body size now renders at the body size and should set one explicitly.

@cixzhang
