---
'@astryxdesign/core': patch
---

[fix] BottomSheet: a pull up from the scroll area now expands the sheet on iOS. Below the tallest detent, dragging up inside the content did nothing on a real device while the grab handle worked — the sheet took the gesture and then froze for the rest of the pull. iOS Safari raises PointerEvents for a finger under the same numeric id it puts in `Touch.identifier`, so the drag the touch path started was keyed to a live pointer: `beginDrag` captured that pointer, WebKit handed the capture straight back, and the `lostpointercapture` a millisecond later cancelled the drag. Touch-driven drags are now marked as such — they take no pointer capture, and `lostpointercapture`, `pointercancel` and `pointermove` for that same finger no longer cancel, end or double-drive them. Browsers that keep the two id spaces apart were never affected, which is why this only showed up on device (#5178).

@imdreamrunner
