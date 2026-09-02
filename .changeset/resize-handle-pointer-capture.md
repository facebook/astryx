---
'@astryxdesign/core': patch
---

[fix] ResizeHandle: a drag survives the cursor crossing an embedded frame. (#5297) The handle listened for `pointermove`/`pointerup` on `window` without taking pointer capture, so the browser hit-tested every later event — and the moment the cursor entered an `<iframe>` inside the resizable region the events went to the guest document instead. Measured in Chromium, the host received 0 of 25 pointermoves once the cursor was over the frame, the panel stopped tracking, and the `pointerup` was never heard: the handle stayed armed with `data-resizing` set and the body cursor/`user-select` overrides stuck. The drag now takes pointer capture on the grab zone on `pointerdown`, so the whole gesture is delivered there whatever is underneath, and the move/up/cancel handlers sit on that element rather than on `window` (the same shape as Slider and BottomSheet).

@cixzhang
