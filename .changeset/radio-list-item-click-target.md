---
'@astryxdesign/core': patch
---

[fix] RadioListItem: the whole row is now a click target. Clicking the description — or the empty space in a row's hover area — selects the radio, matching CheckboxListItem. Previously only the radio and its label text responded, so the description and surrounding row were dead space. The row delegates surface clicks to the radio input (one tab stop per option preserved), and the radio keeps its accessible name via `aria-label`.

@freddymeta
