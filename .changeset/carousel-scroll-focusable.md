---
'@astryxdesign/core': patch
---

[fix] Carousel: make the horizontal scroll container keyboard-focusable (`tabIndex={0}`) so keyboard-only users can scroll it with arrow keys. Previously the scrollable region had no keyboard access (axe: scrollable-region-focusable). (#3343)

@cixzhang
