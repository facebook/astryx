---
'@astryxdesign/core': patch
---

[fix] Calendar: mark today's date cell with `aria-current="date"`. Previously "today" was conveyed only visually, so screen-reader users could not identify the current date (WAI-ARIA date-picker pattern). (#3708)
@bhamodi
