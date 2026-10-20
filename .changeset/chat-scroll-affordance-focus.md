---
'@astryxdesign/core': patch
---

[fix] `ChatLayoutScrollButton`: the scroll-to-bottom pill now gives up keyboard focus, and refuses new focus, as soon as it starts to hide. Previously focus stayed on the fading pill for about half a second, until `visibility: hidden` applied, so it could sit on a control that was fading out or already transparent (WCAG 2.2 SC 2.4.7 Focus Visible). (#7738)

@cixzhang
