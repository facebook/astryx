---
'@astryxdesign/core': patch
---

[fix] CheckboxList: each option is a single tab stop — the checkbox is the option's only focusable control (WCAG 4.1.2). The row is now an enlarged click/tap target that delegates surface clicks to the checkbox via a new `interactiveRef` prop on Item/ListItem (the useClickableContainer pattern), replacing the internal invisible row button. `interactiveRef` is mutually exclusive with `onClick`/`href`.
@bhamodi
