---
'@astryxdesign/core': patch
---

[fix] ComplexSelector: the field focus ring is keyboard-only again. It was the one component still painting on `:focus-within`, and since the popover restores focus to the trigger when it closes, a mouse-driven open/close cycle re-lit the ring and left it lit until focus left the control entirely — read by designers as a selected state that would not clear. It now uses the shared focus-outline utility (`:has(:focus-visible)`), like every other field-and-trigger control, which also brings the ring back to the conventional 3px offset it had drifted from. The keyboard ring is unchanged in kind.

Fixes #4922.

@nynexman4464
