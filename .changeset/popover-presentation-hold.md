---
'@astryxdesign/core': patch
---

[fix] Under a finger, a tap that lands while a Popover is still growing out of its trigger is now ignored, as on iOS: the presentation finishes and the popover stays, and the tap does not reach the page underneath. Before, it closed the popover mid-presentation. Once the popover is in, a tap outside dismisses it as before; under a mouse nothing changes.

@vjeux
