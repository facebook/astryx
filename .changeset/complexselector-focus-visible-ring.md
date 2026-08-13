---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: the trigger's focus ring is now keyboard-only. It was drawn from `:focus-within`, which also matches a mouse click — open the popover with the mouse, dismiss it with the mouse, and the restored focus left a pointer user staring at a keyboard affordance. It now uses the shared `:has(:focus-visible)` ring, which also brings the outline to the documented 3px offset.

@cixzhang
