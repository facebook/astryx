---
'@astryxdesign/core': patch
---

[fix] `reset.css`: a date or time field (`date`, `time`, `datetime-local`, `month`, `week`) now matches a text field with the same styles. In iOS Safari an empty field keeps its height instead of collapsing to its padding, and the value follows the field's `text-align` instead of always centring, so it starts at the same edge as a text field's value. In Chromium the field loses the 2px its row of editable fields added. To keep the old centring in iOS Safari, add `::-webkit-date-and-time-value { text-align: center; }` after the reset.

@vjeux
