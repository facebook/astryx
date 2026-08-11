---
'@astryxdesign/core': minor
---

[breaking] Remove the `dropdown-menu-radio-dot` theme target. Menu radio rows draw the shared radio indicator now, so the dot is the indicator's dot: target `radio-indicator-dot` (the legacy `radio-dot` name still matches it too). The row's circle keeps its `dropdown-menu-radio` target, so only the dot moved.

Runtime themes are not validated — a theme keyed on the removed target keeps compiling and silently stops matching — so `astryx upgrade` now carries `rename-dropdown-menu-radio-dot-target`, which rewrites the key and the `astryx-dropdown-menu-radio-dot` class. The new target is app-wide rather than menu-only (there is no menu-only dot element left to address), so the codemod leaves a TODO at each site it rewrites.

@cixzhang
