---
'@astryxdesign/core': patch
---

[fix] Collapsible: the trigger button now shows a visible focus ring when focused via keyboard. The trigger's `all: unset` reset removed the browser's default outline without restoring a replacement, leaving keyboard focus invisible (WCAG 2.4.7). (#3722)
@bhamodi
