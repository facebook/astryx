---
'@astryxdesign/core': patch
---

[fix] Under a finger, a pan that starts outside an open Popover dismisses it as the page starts to scroll, as a popover on iOS does; before, the popover stayed open and rode along with its trigger. A tap or a hold outside still dismisses it when the finger lifts, and a popover with `hasLightDismiss={false}` stays open. DropdownMenu's touch menu keeps the same rule, now from the shared layer runtime.

@vjeux
