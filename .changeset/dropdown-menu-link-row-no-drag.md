---
'@astryxdesign/core': patch
---

[fix] A mouse press on a `DropdownMenuItem` link row (`href`) that moves a few pixels no longer starts the browser's link drag (#7197). The drag cancelled the press, so the highlight stopped following the mouse and the row under the release never acted; a press dragged from one link row to another now acts on the second, as it already did for rows without an address. Link rows render `draggable="false"`.

@vjeux
