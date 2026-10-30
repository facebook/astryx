---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] New `--ease-exit` token, `cubic-bezier(0.3, 0, 0.6, 0.6)`: an accelerating curve for things leaving the screen, beside `--ease-standard` for things arriving. `BottomSheet` closes on it at the value it already used, so nothing looks different; a theme can now retune that exit through the token. On a touch screen the sheet keeps its own closing curve. `astryx docs motion`, the easing token table, and the theme template list it. (#8004)

@kentonquatman
