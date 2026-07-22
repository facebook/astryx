---
'@astryxdesign/core': patch
---

[fix] Icon: size variants (`xsm`/`sm`/`md`/`lg`) now use `rem` instead of hardcoded `px`, so icons scale in step with text when the document/root `font-size` changes — matching the rest of the design system's rem-based type scale. Fixes #4092.
@cixzhang
