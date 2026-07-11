---
'@astryxdesign/core': patch
---

[fix] Card: draw the `default` variant's border inside its padding and drop the invisible border from the other variants, so a card's total inset (border + padding) matches the spacing token exactly instead of being 1px larger on every side. (#3712)
@kentonquatman
