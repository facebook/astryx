---
'@astryxdesign/core': patch
---

[fix] `Switch` now adds a caller's `aria-describedby` to the switch control, ahead of its own description, status, and disabled-reason ids. Before, the value landed on the field wrapper, so a hint rendered elsewhere on the page could not describe the switch to assistive technology.

@cixzhang
