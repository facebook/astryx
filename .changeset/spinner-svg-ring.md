---
'@astryxdesign/core': patch
---

[refactor] Spinner: the ring is drawn in SVG instead of `<canvas>`. The arc and track take their colours from the cascade (`currentColor` for `shade="inherit"`), so nothing resolves a colour in JS: a colour change after mount now repaints the ring instead of leaving it stale until it remounts, and mounting spinners no longer costs a `getComputedStyle` each. Rings are pinned to the document timeline's origin, so spinners mounted at different times turn in phase. No API, geometry or theme-target change (#5408).

@cixzhang
