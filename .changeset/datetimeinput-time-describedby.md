---
'@astryxdesign/core': patch
---

[fix] DateTimeInput: the embedded time input now carries `aria-describedby` and `aria-busy` like the date input, so screen-reader users keep access to the field's description, status message, and disabled message when focused on the time half. (#3716)
@bhamodi
