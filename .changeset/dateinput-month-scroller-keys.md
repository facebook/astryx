---
'@astryxdesign/core': patch
---

[fix] `DateInput`'s touch calendar (the month scroller): under RTL the horizontal arrows now follow the reading direction — ArrowLeft moves to the next day and ArrowRight to the previous — and PageUp/PageDown move the focused day by a month, keeping the day of the month where it exists. Up/Down, Home/End, and the scroller's touch behavior are unchanged.

@cixzhang
