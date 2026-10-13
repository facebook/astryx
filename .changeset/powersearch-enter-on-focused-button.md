---
'@astryxdesign/core': patch
---

[fix] `PowerSearch`: pressing Enter on a focused button in the filter editor now activates that button. Enter on Cancel closes the editor without applying the draft, and Enter on Delete removes the filter; before, both applied the draft instead. Enter in the field, operator, and value controls still applies the filter.

@cixzhang
