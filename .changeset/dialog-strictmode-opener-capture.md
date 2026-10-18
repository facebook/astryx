---
'@astryxdesign/core': patch
---

[fix] Dialog: under React StrictMode, a dialog first mounted open (an AlertDialog, for example) now returns focus to the element that opened it on close, instead of leaving focus on the page body. The opener is captured only on the closed-to-open edge.

@HelloOjasMutreja
