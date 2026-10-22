---
'@astryxdesign/theme-y2k': patch
'@astryxdesign/cli': patch
---

[feat] Keep Y2K's released `y2kPalettes` object byte-identical while moving the maintained Light/Dark theme to reviewed named palette stops. Periwinkle `#CCCFFA` and Neon Green `#C5E17A` remain exact; syntax becomes brighter, the dark code background moves from `#190F00` to `#0E0F1A`, and dark Gray background moves from `#EDE0D4` to `#DFE2F3`. The necessary dark input and unchecked-selection outline moves from the released `#3A3F5E` to Neutral Dark 45 `#636889`, raising contrast on the input surface from 1.71:1 to 3.23:1. Consumers that need the former appearance can extend `y2kTheme` and override the affected color, syntax, shadow, and component values with their previous values. The CLI template ships the same private palette request, receipt, and runtime-sized references.

@rubyycheung
