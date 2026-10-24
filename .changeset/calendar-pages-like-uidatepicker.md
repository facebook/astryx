---
'@astryxdesign/core': patch
---

[fix] The calendar in the DateInput and DateTimeInput bottom sheets now pages its months like the iOS date picker:

- A swipe moves at most one month, chosen at the lift by iOS's paging rule (a quick flick, or past half a month). It settles on iOS's paging curve instead of letting a fling run across several months.
- The month title follows the drag. It changes when the next month is more than half in view.
- The arrows scroll the month in 0.3 s; a second tap mid-scroll goes on to the month after.
- Inside the sheet, a drag steeper than 45° moves the sheet, and a flatter one stays with the calendar.
- PageUp and PageDown move the keyboard focus by a month, and with Shift by a year.

@vjeux
