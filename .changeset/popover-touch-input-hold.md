---
'@astryxdesign/core': patch
---

[fix] Under a finger, a tap that lands while a Popover is still growing out of its trigger is now ignored, as on iOS: the presentation finishes, the popover stays and keeps its focus, and the tap does not reach the page underneath; a drag that starts then scrolls nothing, while a pinch still zooms the page. Before, it closed the popover mid-presentation. Once the popover is in, a tap outside dismisses it as before; under a mouse nothing changes.

@vjeux
