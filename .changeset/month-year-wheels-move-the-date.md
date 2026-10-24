---
'@astryxdesign/core': patch
---

[fix] The month and year wheels behind the calendar title in the DateInput and DateTimeInput bottom sheets now behave like the iOS date picker's:

- Turning a wheel moves a chosen date to the new month and keeps its day, so October 15 becomes May 15. A day the month lacks becomes its last day, the result stays within `min` and `max`, and DateTimeInput keeps the time.
- With no date chosen, the wheels only move the calendar.
- The month wheel loops from December to January without changing the year.
- A year that takes the month out of range turns the month wheel onto the nearest reachable month instead of jumping.

@vjeux
