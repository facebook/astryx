---
'@astryxdesign/core': patch
---

[docs] `ListItem`'s docs now list `label` as a `ReactNode`, matching its props type: a string is truncated to one line, and any other node renders as given. They used to say `string`, which told readers a rich label had to be restructured away.

@cixzhang
