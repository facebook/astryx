---
'@astryxdesign/core': patch
---

[fix] `Selector`: activating the clear button now returns focus to the trigger, as `hasClear` documents. Previously the button unmounted once the value was cleared and focus fell to `<body>`, so a keyboard user had to Tab back in from the top of the page.

@kyu-rong
