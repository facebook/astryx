---
'@astryxdesign/core': patch
---

[fix] SegmentedControl segments keep their width when the selection changes. The selected label is heavier, so a segment sized to its own label grew as it was selected and shrank as it was deselected (about 2–3 px in a content-sized control), shifting its neighbors. Each label now reserves its selected width.
@vjeux
