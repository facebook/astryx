---
'@astryxdesign/core': patch
---

[fix] The time wheels in the TimeInput and DateTimeInput bottom sheets now follow iOS's date picker:

- The AM/PM column follows the hour. Turning the hour from 11 to 12 now gives 12 PM, not 12 AM, and the AM/PM column turns onto PM.
- The hour, minute and second columns loop. Minutes no longer carry into the hour.
- The minute column steps by TimeInput's `increment` or DateTimeInput's `timeIncrement` when it divides 60. A time between two steps shows rounded to the nearest one until a wheel moves.
- A time past `min` or `max` commits as the bound, and the other columns move onto it.

@vjeux
