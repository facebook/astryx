---
'@astryxdesign/core': patch
---

[fix] Link: hovering now shifts the link color via the hover tint (`color-mix` with `--color-tint-hover`, matching Slider/Switch/RadioList). This gives always-underlined links (`hasUnderline`) a visible hover affordance they previously lacked — their underline never changed on hover — without altering the default link's underline-on-hover behavior (#2852)
@durvesh1992
