---
'@astryxdesign/core': patch
---

[fix] Typeahead: Tab out of the field now moves focus to the next control. The result list is dismissed on the Tab keydown rather than from the blur that press produces — hiding a top-layer popover during the focusout makes Chrome abandon the in-flight focus move and drop focus to `<body>`, so the press appeared to do nothing. Selector and MultiSelector already dismissed on the keydown (#5400).
@cixzhang
