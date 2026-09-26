---
'@astryxdesign/core': patch
---

[feat] `useTableColumnResize` now reveals its handles when the pointer enters the header. The boundaries were only drawn once the pointer was already within a handle's 8px hit area, so a resizable column gave no sign it could be resized. Every boundary now appears at border weight while the header is hovered, and the handle under the pointer still takes accent. The reveal holds while the table is scrolling sideways, so a boundary arriving under a still pointer is not mistaken for intent, and focusing a handle emphasizes that one boundary without drawing its neighbours. Pointer-only: where nothing can hover, nothing is revealed. (#6194)
@ernestt
