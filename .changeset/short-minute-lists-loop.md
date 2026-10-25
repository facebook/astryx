---
'@astryxdesign/core': patch
---

[fix] Under a finger, the minute wheel in the TimeInput and DateTimeInput bottom sheets loops at every step, as iOS's date picker does. Stepped by 6, 10, 12, 15, 20 or 30 minutes it stopped at its first and last step; now copies of its steps fill the whole wheel, it wraps both ways, a tap lands on the copy tapped, and the hour does not carry (11:45 PM turns to 11:00 PM).

@vjeux
