---
'@astryxdesign/core': patch
---

[fix] `DateRangeInput`: activating the clear button with the keyboard now returns focus to the range trigger. Previously the button unmounted once the range was cleared and focus fell to `<body>`, so a keyboard user had to Tab back in from the top of the page. Pointer clears are unchanged.

@kyu-rong
