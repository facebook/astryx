---
'@astryxdesign/core': patch
---

[fix] TimeInput: typed-invalid input (e.g. an out-of-range time that will be reverted on blur) now sets `aria-invalid` and announces "Invalid time" via an assertive live region, matching DateInput, NumberInput, and DateTimeInput. Previously only the visual red border signalled the invalid state. (#3718)
@bhamodi
