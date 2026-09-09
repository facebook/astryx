---
'@astryxdesign/core': patch
---

[feat] `useTableColumnResize` now reveals its handles when the pointer enters the header. The boundaries were only drawn once the pointer was already within a handle's 8px hit area, so a resizable column gave no sign it could be resized. Every boundary now appears at border weight while the header is hovered, and the handle under the pointer still takes accent. Pointer-only, and unchanged on touch, where the handles do not render.

@ernestt
