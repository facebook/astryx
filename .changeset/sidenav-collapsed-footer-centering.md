---
'@astryxdesign/core': patch
---

[fix] SideNav: center `footer` content in the collapsed rail. The collapsed variant of the sticky-bottom slot was missing the `alignItems: 'center'` that the children slot's collapsed variant already applies, so footer content stretched to the full rail width instead of centering.

@AKnassa
