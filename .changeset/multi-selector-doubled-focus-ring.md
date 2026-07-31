---
'@astryxdesign/core': patch
---

[fix] MultiSelector: remove the trigger button's own focus outline so it no
longer doubles the field wrapper's focus ring. The wrapper renders a single
`:focus-within` ring, matching `Selector` and the other bordered inputs.
@freddymeta
