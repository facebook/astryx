---
'@astryxdesign/core': patch
---

[fix] A tap on a Typeahead's selected value raises the touch keyboard. Entering edit mode now focuses the input and selects the value's text inside the tap itself instead of one frame later; iOS raises its keyboard only for a focus made while the browser is still handling the tap, so the deferred focus left a caret with no keyboard until a second tap.

@vjeux
