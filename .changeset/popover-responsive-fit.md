---
'@astryxdesign/core': patch
---

[fix] Popover layers now cap explicit widths and match-trigger sizing to the available viewport with alignment-aware token safe-area gutters, preserving trigger alignment while keeping the painted surface at least one spacing token from both viewport edges. Long content scrolls inside the layer instead of forcing page overflow on narrow viewports. Repeated resize and content-change signals coalesce overflow measurement to once per animation frame. Pointer-activated dialog popovers focus the labeled dialog container so the first action does not appear preselected, while keyboard activation still focuses the first content control. Read-only content uses the same container target without revealing the fallback close button, while preserving Tab access to that fallback escape control.

@rubyycheung
