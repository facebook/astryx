---
'@astryxdesign/core': patch
---

[fix] Under a finger, the time wheels in the TimeInput and DateTimeInput bottom sheets now follow iOS's date picker, on iPhone and Android alike:

- The AM/PM column follows the hour. Turning the hour from 11 to 12 now gives 12 PM, not 12 AM, and the AM/PM column turns onto PM.
- The hour, minute and second columns loop, except a minute column stepped by 10, 15 or 30 minutes, which stops at its first and last step for now. Minutes no longer carry into the hour.
- The minute column steps by TimeInput's `increment` or DateTimeInput's `timeIncrement` when it divides 60. A time between two steps shows rounded to the nearest step inside the day and the bounds until a wheel moves, and the seconds stay as they are.
- A time past `min` or `max` commits as the bound, and the other columns move onto it.

With a mouse, the sheet keeps today's independent columns.

@vjeux
