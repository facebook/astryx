---
'@astryxdesign/core': patch
---

[fix] DateInput's native surface (`nativePicker`) now shows the engine's own date segments while the control has focus, instead of painting over them. On iOS and Android `<input type="date">` is a single untypable run, so DateInput's formatted text can cover it; on desktop engines — and in Chrome's touch simulator — it is a row of editable `mm`/`dd`/`yyyy` fields, and covering those hid the digits being typed. `format` reapplies on blur.

@imdreamrunner
