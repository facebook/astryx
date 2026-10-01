---
'@astryxdesign/core': patch
---

[feat] Layers fitted to the viewport (Popover, DropdownMenu and its submenus) read a per-edge inset from `--astryx-layer-inset-block-end`, `--astryx-layer-inset-block-start`, `--astryx-layer-inset-inline-start` and `--astryx-layer-inset-inline-end`, added to the existing spacing-4 + safe-area gutter. An app declares a persistent bar floating over the viewport (a phone navigation bar) once on `:root` and every layer ends above it. Unset properties read as 0px, so nothing moves by default.

@vjeux
