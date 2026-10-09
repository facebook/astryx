---
'@astryxdesign/core': patch
---

[fix] Turn only the chevron glyph in `useTableRowExpansion`, not the button beneath it. (#5995)
@ernestt

The rotation was on the `<button>`, which is the hit target and carries the hover chip, so opening a row swung that rounded rectangle and its highlight a quarter turn along with the arrow — most visible mid-animation, where the chip passes through a diamond. A finished 90° turn on a 24px rounded square lands back on itself, which is why this only shows up in motion.

The transform now sits on the glyph and the button stays put. The two transitions move onto `--duration-fast` and `--ease-standard` in the same pass, matching what `TableRow` already uses for its own hover transition.
