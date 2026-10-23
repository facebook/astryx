---
'@astryxdesign/core': patch
---

[fix] Carousel: when the focused edge scroll button runs out (the carousel reached that edge), focus now moves to the scroll area without scrolling it, instead of to the opposite scroll button. This follows the Carousel record (`component:Carousel` FR2) and spec:AST-085 FR4. No API changes.

@cixzhang
