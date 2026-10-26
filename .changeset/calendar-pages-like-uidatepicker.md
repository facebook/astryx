---
'@astryxdesign/core': patch
---

[fix] Under a finger, the calendar in the DateInput and DateTimeInput bottom sheets now pages its months like the iOS date picker, on iPhone and Android alike:

- A swipe moves at most one month, chosen at the lift by iOS's paging rule (a quick flick, or past half a month). It settles on iOS's paging curve instead of letting a fling run across several months.
- The month title follows the drag and the settle that ends it. It changes when the next month is more than half in view, not at the lift.
- The arrows scroll the month in 0.3 s; a second tap mid-scroll goes on to the month after.
- Inside the sheet, a drag is decided as on iOS, once it has moved 10 px either way: it pages the calendar if it has moved 10 px sideways by then, and moves the sheet otherwise. A steady drag up to 45° pages the calendar; a fast one does even when steeper.
- A horizontal trackpad swipe, or Shift with a mouse wheel, pages one month per gesture too.

With a mouse, the calendar keeps today's native scrolling. On every pointer, PageUp and PageDown now move the keyboard focus by a month, and with Shift by a year.

With Reduce Motion on (`design:reduced-motion`), the months no longer travel under a finger: the arrows' step and a swipe's settle cross-fade in 200 ms.

@vjeux
