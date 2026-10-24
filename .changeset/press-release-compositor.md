---
'@astryxdesign/core': patch
---

[fix] A button's or a card's touch press release now runs on the compositor: it keeps fading while the page's script is busy instead of freezing at full strength and snapping off, and it paints nothing per frame. The release follows UIButton's highlight release (250 ms, ease-in-out); a list row's stays on the deselect clock. The pressed colour and the mouse states are unchanged.

@vjeux
