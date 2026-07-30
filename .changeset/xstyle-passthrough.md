---
'@astryxdesign/core': patch
---

[fix] Honor the `xstyle` prop on `TopNavMenu`, `TopNavMegaMenu`, `TopNavMegaMenuItem`, `DropdownMenuRadioGroup`, and `BaseTypeahead`, which accepted it via `BaseProps` but silently dropped it. `VisuallyHidden` now explicitly opts out of `xstyle`.
@cixzhang
