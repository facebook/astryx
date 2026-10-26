---
'@astryxdesign/core': patch
---

[fix] useLayer: a show that a browser-run popover hide refuses (Chromium 156 throws an `InvalidStateError`) is replayed once that hide has ended, so the layer ends shown. For example, pressing Escape inside a popover returns focus to its trigger, whose tooltip now opens instead of failing.

@vjeux
