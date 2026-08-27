---
'@astryxdesign/core': patch
---

[fix] `TransferList` and `TransferListSelector` now route every user- and screen-reader-facing string through the i18n catalog, and no longer disable themselves while an async change is pending. Previously all 28 strings were hardcoded English literals — panel headings, row action labels, locked-item tooltips, the keyboard reorder instructions, and every live-region announcement — and item counts were pluralized by a `count === 1` ternary rather than an ICU plural, so no locale with different plural rules could ever read correctly. Separately, `TransferListSelector` wrapped its list in `<fieldset disabled={isDisabled || state.isBusy}>`, and because the user is holding focus on the Add or Remove button that started the change, disabling on busy dropped their focus to `<body>`. Busy is now carried by `aria-busy` and the trigger's existing spinner, with transfers ignored until the change settles.

@ernestt
