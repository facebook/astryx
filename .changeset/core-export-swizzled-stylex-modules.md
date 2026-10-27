---
'@astryxdesign/core': patch
---

[fix] `@astryxdesign/core` exports the `Layer/layerStructureReset.stylex` and `DropdownMenu/menuBottomSheet.stylex` subpaths. `astryx swizzle` rewrites a component's cross-directory StyleX imports to these deep paths, and Dialog, Drawer, BottomSheet, Lightbox, MobileNav, Toast and ContextMenu import one of them, so their swizzled copies failed to resolve in the consumer's build. The swizzle test now checks every component's rewritten imports against the exports map, not only Button's.

@thecodebasedot
