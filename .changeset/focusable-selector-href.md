---
'@astryxdesign/core': patch
---

[fix] focusableSelector: match only real links (`a[href]`, `area[href]`) instead of any element with an href attribute. Previously non-focusable elements carrying href could be treated as tab stops by useFocusTrap. (#3714)
@bhamodi
