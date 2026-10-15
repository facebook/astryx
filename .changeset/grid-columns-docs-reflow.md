---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[docs] Grid's `columns` docs now lead with the shape that reflows: a numeric `columns` is exactly N columns at every width and never reflows, and `columns={{minWidth, max}}` is the form for columns that must survive a phone. The `astryx docs layout/responsive` topic gains a "Columns that reflow" section with a reflowing stat row beside a fixed week row. No behavior changes.

@cixzhang
