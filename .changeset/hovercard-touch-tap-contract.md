---
'@astryxdesign/core': patch
---

[fix] HoverCard: a tap no longer opens the card and activates the trigger at the same time. On touch the card follows the new `touchTrigger` contract — `auto` (default) opens on a tap only when the tap is not activating a link or button, `always` gives any trigger the two-tap preview-then-activate contract, `never` leaves taps alone.

@cixzhang
