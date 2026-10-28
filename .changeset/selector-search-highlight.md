---
'@astryxdesign/core': patch
---

[fix] In a searchable `Selector`, typing now highlights the first enabled match of the new list, so Enter picks the option you see highlighted; before, the highlight kept its old position, which could point at a different option or at nothing. In a searchable `MultiSelector`, typing clears the highlight instead, so Enter never picks a row you did not highlight, and ArrowDown starts at the first match.

@cixzhang
