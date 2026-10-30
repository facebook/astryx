---
'@astryxdesign/core': patch
---

[feat] Under a finger, the minute wheel in the TimeInput and DateTimeInput bottom sheets steps by TimeInput's `increment` or DateTimeInput's `timeIncrement` when it divides 60, and loops at every step, as iOS's date picker does. A time between two steps shows rounded to the nearest step until a wheel moves (inside the day, and inside the bounds when the time is), and the seconds stay as they are. With a mouse, the wheels still list every minute.

@vjeux
