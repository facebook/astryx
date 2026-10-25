---
'@astryxdesign/core': patch
---

[fix] Under a finger, a pan that starts outside an open Popover, its trigger included, dismisses it as the page starts to scroll, as a popover on iOS does; before, the popover stayed open and rode along with its trigger. A tap or a hold outside still dismisses it when the finger lifts, and a popover with `hasLightDismiss={false}` stays open. A pan that starts inside a popover that does not scroll no longer scrolls the page behind it, and a pinch there still zooms the page.

@vjeux
