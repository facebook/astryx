---
'@astryxdesign/core': patch
---

[fix] On a touch screen, a checkbox and a radio option are now as easy to hit as an iOS control (44 pt). A standalone CheckboxInput's row is at least 44 px tall, and its target is at least 44 × 44 px, centered on the 20 or 24 px box. Each RadioList row is at least 44 px tall, and the rows touch, so the whole column is target. With a mouse or trackpad the sizes are unchanged. The CheckboxInput `size` docs now give the real box sizes.

@vjeux
