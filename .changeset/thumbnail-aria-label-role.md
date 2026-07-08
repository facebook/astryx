---
'@astryxdesign/core': patch
---

[fix] Thumbnail: give the labeled root a group role so its accessible name is valid. Previously the file name was set via aria-label on a plain div with no role, which axe flags as aria-prohibited-attr (serious) because a generic element cannot carry a name. (#3343)
@cixzhang
