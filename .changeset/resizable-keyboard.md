---
'@astryxdesign/core': patch
---

[fix] Resizable: keyboard resizing now works. The keydown handler was attached to a non-focusable child of the separator, so Arrow/Home/End keys never fired for keyboard users; it now lives on the focusable `role="separator"` element per the WAI-ARIA window-splitter pattern. (#3729)
@bhamodi
