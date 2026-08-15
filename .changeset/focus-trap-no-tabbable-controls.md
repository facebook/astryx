---
'@astryxdesign/core': patch
---

[fix] `useFocusTrap`: a modal surface with no tabbable controls keeps its programmatic focus target instead of letting Tab escape into the page behind it. A dialog that places initial focus on a `tabIndex={-1}` heading or panel had nowhere to advance to, so Tab walked straight out of the trap. `@astryxdesign/core/hooks` also exports `hasActiveFocusTrapEscape` and `isImeKeyEvent`, which coordinate nested traps and skip IME composition keys (#5023).

@imdreamrunner
