---
'@astryxdesign/theme-matcha': patch
'@astryxdesign/cli': patch
---

[feat] Move Matcha's existing color roles onto its reviewed light and dark ramps, including Tea Gold. Warning and Yellow move from `#FFB600` / `#FFC940` to `#F2C000` / `#F6D066`; related syntax colors and warning inset rings follow the same palette. Consumers that need the former appearance can extend `matchaTheme` and override the affected color, syntax, shadow, and component tokens with their previous values. The complete Matcha palette remains private authoring data, and the CLI template ships the same request, receipt, and runtime-sized references. (#7671)

@rubyycheung
