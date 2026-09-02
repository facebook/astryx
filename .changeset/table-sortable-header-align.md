---
'@astryxdesign/core': patch
---

[fix] Table's sortable header button now follows its column's `align`, so an `align: 'end'` or `align: 'center'` column no longer gets a start-hugging header label sitting above right-aligned figures. Sorting wraps the header in a full-width flex button, which the `textAlign` that `align` sets on the cell cannot position; the alignment is now carried onto the button's main axis with a flow-relative `justify-content`, so it keeps mirroring under RTL.

@ernestt
