---
'@astryxdesign/core': patch
---

[feat] `List`: add `isEdgeAligned` to align item content flush with the container edge (#2626)

`ListItem` insets its content by a density-dependent horizontal padding (8px for compact/balanced, 12px for spacious), so a list under a section heading reads as misaligned and consumers reach for negative-margin custom CSS. `isEdgeAligned` on `List` cancels that inset with a matching negative margin on the list element, tracking density automatically; the header, hover, and selection backgrounds keep their existing geometry.
@jiunshinn
