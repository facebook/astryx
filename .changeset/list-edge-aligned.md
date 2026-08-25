---
'@astryxdesign/core': patch
---

[feat] `List`: add `isEdgeAligned` to align item content flush with the container edge (#2626)

`ListItem` insets its content by a density-dependent horizontal padding, so a list under a section heading reads as misaligned and consumers reach for negative-margin custom CSS. `isEdgeAligned` on `List` cancels that inset with a matching negative margin on each row; the header, hover, and selection backgrounds keep their existing geometry.

`Item` now publishes its inline inset as `--_item-inset-inline` and derives its own `paddingInline` from it, and the cancelling margin reads the same variable — so the cancel tracks density and theme overrides instead of mirroring hardcoded values. Themes that set `paddingInline` on `item` feed the variable automatically via the derived var registry.
@jiunshinn
