---
'@astryxdesign/core': patch
---

[fix] `Switch` with `isLabelHidden` no longer reserves the label gap. The hidden label is `sr-only`, but its wrapper stayed a flex item, so the row still painted the 8px gap beside it: the field box measured 8px wider than the track it contains, and a hidden-label switch stopped 8px inside the edge every neighbouring control lined up on. The gap now collapses with the label, so the field is exactly as wide as the painted track — matching `CheckboxInput`, which already did this.

@cixzhang
