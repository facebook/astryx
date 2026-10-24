---
'@astryxdesign/core': patch
---

[fix] Under a finger, opening the bottom sheet of a DateInput or DateTimeInput, and its month and year wheels, no longer blocks the page longer for each year in the range. A picker wheel now draws only the rows around its band, as UIPickerView lays out only the rows it shows, so drawing a wheel costs the same for 12 rows or 200. Every option is still listed for assistive technology, and a fling or a drag draws the rows it reaches before they come into sight. In Mobile Safari (iOS 26.2 simulator), opening the year wheel of a 200-year range used to hold the page for 278–754 ms; it now takes 54–65 ms.

@vjeux
