---
'@astryxdesign/core': patch
---

[fix] Markdown: keep a definition-shaped line whose label is over 999 characters
@cixzhang

`Markdown` no longer drops a line shaped like a link reference definition whose label holds more than 999 characters. CommonMark allows no such definition, so the line now shows as text, as a reference with that label already did.
