---
'@astryxdesign/core': patch
---

[fix] ChatToolCalls: hover backgrounds on grouped call rows (2+ calls) now keep their full `--radius-element` rounding instead of getting clipped flat on the inline edges. `groupContentInner` — the `overflow: hidden` clip boundary the expand/collapse height animation needs — was missing the padding/negative-margin pair that absorbs the row-level hover-background overhang, so the overhang extended past the clip boundary and got cut off. Matches the ungrouped single-call row, which has no such wrapper to clip it.

@HelloOjasMutreja
