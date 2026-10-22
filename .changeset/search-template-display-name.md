---
'@astryxdesign/cli': patch
---

[fix] `astryx search` and `astryx build` find a block by its authored display name when that name has two words or more and holds every word of the component the block shows: a query naming it, such as "rich text editor" for an integration's Rich Text Editor block, ranks it first. A display name that labels only the variant, such as "Inside a card", is not read.

@josephfarina
