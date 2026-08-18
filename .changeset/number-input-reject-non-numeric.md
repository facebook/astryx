---
'@astryxdesign/core': patch
---

[fix] NumberInput: reject non-numeric characters again, the way the native control does. After the input moved to `type="text"` for formatted display, letters and stray symbols were visibly accepted until blur (`inputMode` is only a mobile-keyboard hint and does not restrict a physical keyboard). The character is now refused at `beforeinput`, so — as with `type="number"` — the edit never happens and the caret does not move: with the caret after the `1` in `123`, typing `a` then `9` gives `1923`. Values pasted with whitespace, thousands separators or full-width digits (`42 `, `1,234`, `１２３`) are normalized instead of discarded, and malformed-but-numeric text (`--1`) is still kept as pending input and surfaced through `aria-invalid` rather than silently dropped.

@freddymeta
