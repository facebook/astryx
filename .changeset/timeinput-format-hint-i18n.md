---
'@astryxdesign/core': patch
---

[fix] TimeInput: the format hint shown while an empty field has focus ("e.g., 2:30 PM" / "e.g., 14:30") now comes from the message catalog (`@astryx.timeInput.formatHint`), so its wording follows the app's locale. The sample time uses the field's own display format.

@cixzhang
