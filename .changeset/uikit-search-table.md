---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Themes can retune the search field's motion: three new motion roles, `search.activationMs`, `search.activationCurve` and `search.scrollAway.snapMs`, carried by `--motion-search-activation-ms`, `--motion-search-activation-curve` and `--motion-search-scroll-away-snap-ms`, and listed by `astryx docs motion`. They come from the UIKit constants table's new search entries, measured on iOS 26.2: the search bar's activation and cancel clock (383 ms on ease-in-ease-out), the stacked field's geometry and its close button's entrance, the navigation bar's fades over an activation, the field scrolling away with the content, the bottom placement's rest above the keyboard and the clear button, each with its source. The table itself is internal and not exported from the package entry point; no shipped component reads the roles yet.

@vjeux
