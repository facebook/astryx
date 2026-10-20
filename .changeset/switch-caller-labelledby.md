---
'@astryxdesign/core': patch
---

[fix] `Switch` now puts a caller's `aria-labelledby` on the switch control. Before, the value landed on the field wrapper, so a visible title elsewhere in the row could not name the switch for assistive technology.

@cixzhang
