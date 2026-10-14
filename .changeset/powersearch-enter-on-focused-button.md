---
'@astryxdesign/core': patch
---

[fix] `PowerSearch`: pressing Enter on a focused button in the filter editor now activates that button. Enter on Cancel closes the editor without applying the draft, and Enter on Delete removes the filter; before, both applied the draft instead. Enter in a text or number value field still applies the filter; Enter on the date picker's calendar button now opens the calendar.

@cixzhang
