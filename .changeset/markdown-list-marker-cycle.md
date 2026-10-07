---
'@astryxdesign/core': patch
---

[feat] Markdown: nested lists draw a different marker at each depth
@cixzhang

Bulleted lists cycle disc, circle, and square, and numbered lists cycle decimal, lower-alpha, and lower-roman, by how many lists of either kind enclose them, so each level can be told apart from the levels beside it. Numbering keeps each list's start and items. `List` and `ListItem` keep their public marker styles.
