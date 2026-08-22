---
'@astryxdesign/core': patch
---

[feat] `SegmentedControlItem` takes a `count` — the tally a tab strip needs to say how many rows each choice holds ("Needs me 12"), rendered inside the segment so it stays within the hit target and the `layout="fill"` widths. The number is `aria-hidden` and `countLabel` names what it counts, so the segment announces "Needs me, 12 sessions" instead of the bare "Needs me 12" a screen reader would otherwise read. It renders at every width, including an icon-only segment (`isLabelHidden`), and stays out of the selected segment's bold weight.

@cixzhang
