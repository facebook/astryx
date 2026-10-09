---
'@astryxdesign/core': patch
---

[fix] BottomSheet no longer blocks pinch-zoom. A pinch that started on an open sheet (its handle, its content, or across both) did nothing, because the sheet claimed every touch gesture: `touch-action: none` on the sheet and handle, `pan-y` on the content. The sheet now leaves pinch to the browser (`pinch-zoom`, and `pan-y pinch-zoom` on the content), and a second finger (on the handle, on the content, or off the sheet, whichever lands first) ends any sheet drag in flight or about to start, so the page zooms and the sheet stays at its detent. One-finger drag and scroll are unchanged.

@cixzhang
