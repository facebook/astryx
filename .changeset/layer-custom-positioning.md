---
'@astryxdesign/core': patch
---

[feat] useLayer: new `positioning: 'custom'` context render option for consumers that author their own position styles (explicit `anchor()` insets, `anchor-size()` covers). Keeps the popover behavior and `position-anchor` wiring but derives no position styles from `placement`/`alignment` — including the automatic RTL mirroring, which becomes the consumer's responsibility (#3389).
@AKnassa
