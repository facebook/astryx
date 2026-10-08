---
'@astryxdesign/core': patch
---

[fix] A BottomSheet drag writes its transform straight to the sheet once per input sample and renders nothing in between (React state changes when the drag begins and ends, and when its layout split changes). Measured in Chromium: 4 commits for a 24-sample drag, down from 49. The release still animates from wherever the finger left the sheet.

@vjeux
