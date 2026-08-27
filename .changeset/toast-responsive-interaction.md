---
'@astryxdesign/core': patch
---

[fix] Toast now stays within viewport and safe-area gutters; wraps long messages without clipping; keeps actions and dismissal aligned to the first text line when the message wraps; tightens inter-Toast spacing from 12px to 8px while preserving the viewport-edge gutter; collapses dismissed Toasts smoothly; enters and exits toward its configured top or bottom edge; and exposes the Notifications landmark only while Toasts are present. Placement, visible-stack limits, auto-hide defaults, announcement semantics, dismissal reasons, and browser-chrome behavior remain unchanged.

@rubyycheung
