---
'@astryxdesign/core': patch
---

[feat] ProgressBar: add self-contained and paired-with-value presentations

`presentation="self-contained"` renders an 8px range-end marker so the total
range remains visible without nearby value text. `hasValueLabel` automatically
uses `paired-with-value`; select it explicitly only when equivalent visible text
is rendered nearby. Indeterminate bars retain the self-contained fill/track
pairing.

@rubyycheung
