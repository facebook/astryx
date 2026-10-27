---
'@astryxdesign/core': patch
---

[feature] Under a finger, a DropdownMenu or MoreMenu trigger now opens its menu as the finger presses, instead of after a 500 ms hold (`spec:AST-094` FR29). Inside a scroll view it opens once the 150 ms content-touch delay has passed with no scroll, so a scroll that starts on it still scrolls. The finger that opened the menu picks a row only after it has moved 10 px, so a menu that appears under a resting finger never picks the row beneath it. To keep the previous behavior, a tap that opens at the lift, a 500 ms hold and the settle rule, pass `presentation="popover"`. A mouse is unchanged.

@vjeux
