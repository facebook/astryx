---
'@astryxdesign/core': patch
---

[fix] Selector, MultiSelector: the combobox trigger is now keyboard-focusable (`tabIndex=0` when enabled). Previously it was `tabIndex=-1`, so keyboard and screen-reader users could not open or operate the control in the default (non-search) mode. The Clear button is now keyboard-reachable too (#3320)
@cixzhang
