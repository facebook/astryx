---
'@astryxdesign/core': patch
---

[fix] DateInput and DateTimeInput no longer steal focus when the open calendar is dismissed by clicking another control. Clicking the field to open the calendar, then clicking the time input (DateTimeInput) or any other element, kept yanking focus back to the date input because the popover's close handler always refocused it. It now restores focus only when the dismiss left focus detached (Escape, or a click on empty space), so a click that lands focus elsewhere is respected.

@freddymeta
