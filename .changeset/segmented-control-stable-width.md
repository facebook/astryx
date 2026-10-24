---
'@astryxdesign/core': patch
---

[fix] SegmentedControl segments keep their width when the selection changes. The selected label is heavier, so a segment sized to its own label grew as it was selected and shrank as it was deselected, shifting its neighbors: 2–3 px in a content-sized control where the font has no face at the selected weight (as on Linux Chromium), under a pixel with the iOS and Android system fonts. Each label now reserves its selected width. Each label now also renders twice in the markup (the visible title and an aria-hidden twin), so a test that finds a segment with `getByText('Grid')` matches two nodes; find segments by role and name instead (`getByRole('radio', {name: 'Grid'})`).
@vjeux
