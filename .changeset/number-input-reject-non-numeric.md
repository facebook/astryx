---
'@astryxdesign/core': patch
---

[fix] NumberInput: reject non-numeric characters again. After the input moved to `type="text"` for formatted display, letters and stray symbols were visibly accepted until blur (`inputMode` is only a mobile-keyboard hint and does not restrict a physical keyboard). Non-numeric text is now blocked as you type, while numeric-but-constraint-violating values (e.g. a decimal under `isIntegerOnly`) are still kept as pending input and surfaced as invalid.

@freddymeta
