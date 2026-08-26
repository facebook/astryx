---
'@astryxdesign/core': patch
---

[fix] Selector, MultiSelector, and ComplexSelector now block popup activation while `isLoading` is true. Previously the trigger opened a blank panel because nothing gated activation during a loading state. The trigger remains focusable and visible (no disabled treatment); only activation is suppressed via the existing combobox guards.

@athz
