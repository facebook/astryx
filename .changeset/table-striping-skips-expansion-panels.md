---
'@astryxdesign/core': patch
---

[fix] `Table` zebra striping counts data rows only, so expanding a row no longer inverts the stripe of every row below it. (#5995)
@ernestt

A row-expansion detail panel is appended as a sibling `<tr>` in the same `<tbody>`, and striping is `:nth-child(even)` — so the panel took a stripe turn of its own and pushed every row after it onto the opposite one. Opening a single row repainted half the table.

The stripe now counts `:nth-child(even of :not([data-expansion-panel]))`. A panel is not a row and is not counted as one; the data rows keep their parity whatever is open, and the panel — which paints no background of its own — reads as its row's continuation.

`of S` has been Baseline since 2023, inside Astryx's support floor (AST-013). Below it the stripe rule is dropped rather than misapplied: an unstriped table, not a mis-striped one.

Tables without the row-expansion plugin are unaffected — nothing else in the system emits `data-expansion-panel`.
