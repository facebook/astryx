---
'@astryxdesign/core': patch
---

[feat] EXPLORATION: drag up from the page to open a BottomSheet. Core gains a `dragSource` prop and a `createSheetDragSource()` seam, so a gesture recognized anywhere on the page can present a closed sheet mid-touch and pull it up on the same finger; the release runs through the sheet's existing settle, so a pull that stops short falls back closed. Lab gains `useSheetOpenGesture()`, the recognizer that decides which touches qualify (the end of the page, or a region you mark). Touch only, opt-in, and always an accelerator — never the only way into a sheet.

@imdreamrunner
