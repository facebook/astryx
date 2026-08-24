---
'@astryxdesign/core': patch
---

[fix] PowerSearch: the edit popover now fits narrow viewports — its 400px minimum width yields to the screen width, and the filter row wraps instead of overflowing when long translated operator labels don't fit. An editor anchored near the screen edge now stays on its own side at the width available there, wrapping internally, instead of flipping across the anchor to keep 400px (#4768).

@AKnassa
