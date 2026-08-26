---
'@astryxdesign/core': patch
---

[feat] `List`: add `isFullBleed` to align item content with the padded container edge (#2626)

`ListItem` insets its content by a density-dependent horizontal padding, so a list under a section heading reads as misaligned and consumers reach for negative-margin custom CSS. `isFullBleed` on `List` cancels the smaller of that inset and the container's published padding on each row; zero-padding and full-bleed surfaces therefore stay in place, while headers, hover backgrounds, and selection backgrounds keep their existing geometry.

`Item` now publishes its inline inset as `--_item-inset-inline` and derives its own `paddingInline` from it, and the clamped cancelling margin reads the same variable — so the cancel tracks density and theme overrides instead of mirroring hardcoded values. Themes that set `paddingInline` on `item` feed the variable automatically via the derived var registry.
@jiunshinn
