---
'@astryxdesign/core': patch
---

[fix] Under a finger, the time wheels in the TimeInput and DateTimeInput bottom sheets now follow iOS's date picker:

- The AM/PM column follows the hour. Turning the hour from 11 to 12 now gives 12 PM, not 12 AM, and the AM/PM column turns onto PM.
- The hour, minute and second columns loop. Minutes no longer carry into the hour.
- A wheel that comes to rest past `min` or `max` goes on to the nearest time inside them (with a minute step, the nearest step inside) and commits it there, and the other columns turn onto it. Opening the sheet never changes the value: a time outside the bounds stays as it is, and an empty field stays empty.

With a mouse, the sheet keeps today's independent columns.

@vjeux
