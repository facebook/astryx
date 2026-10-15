---
'@astryxdesign/core': patch
---

[fix] `MultiSelector`: activating the clear button with the keyboard now returns focus to the trigger, as `hasClear` documents. Previously the button unmounted once the selection was empty and focus fell to `<body>`, so a keyboard user had to Tab back in from the top of the page. Pointer clears are unchanged.

@kyu-rong
