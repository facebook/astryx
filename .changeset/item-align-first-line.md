---
'@astryxdesign/core': patch
---

[feat] `Item` accepts `align="first-line"`, which centers each start and end slot on the label's first line. A small status dot, radio, checkbox, or timestamp beside a wrapping label now stays level with the first line, where `center` drops it to the middle of the row and `start` leaves it above the line. A slot taller than the first line moves the text down rather than leaving the row, and a one-line row with no description looks the same as `center`. `ListItem`, `RadioListItem`, and `CheckboxListItem` accept the same `align` and pass it to their row. Themes can style these rows through the `item` target's `align` axis. The default stays `center`, so existing rows don't change.

@cixzhang
