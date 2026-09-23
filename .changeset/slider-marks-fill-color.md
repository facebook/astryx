---
'@astryxdesign/core': patch
---

[fix] Slider marks inside the filled region use the fill color: marks at or behind the thumb in single mode, and marks between the thumbs in range mode, now paint with the accent fill color instead of the default mark color. Marks on the unfilled side are unchanged. (#6455)

@kentonquatman
