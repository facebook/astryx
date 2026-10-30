---
'@astryxdesign/core': patch
---

[fix] Under a finger, a tap that lands while a DropdownMenu is still growing out of its trigger is now ignored, as on iOS: the menu finishes opening, stays open and keeps its focus, and the tap does not reach the page underneath; a drag that starts then scrolls nothing, while a pinch still zooms the page. Before, the tap closed the menu mid-open. Once the menu is open, a tap outside dismisses it as before; under a mouse, and with `presentation="popover"`, nothing changes.

@vjeux
