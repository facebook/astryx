---
'@astryxdesign/theme-butter': patch
'@astryxdesign/cli': patch
---

[feat] Keep Butter's released `butterPalettes` object byte-identical while moving the maintained Light/Dark theme to reviewed named palette stops. Signature Blue `#225BFF`, Butter Yellow `#FDEE8C`, and warm body surfaces remain exact; status fills move from success `#91D143` to `#7BBF7A`, warning `#FFC502` to `#DFCF5B`, error `#FC473B` to `#E56241`, and info `#4883FD` to `#4D82FF`. Info and error content changes from white to warm Neutral `#1D1C11`, the neutral Badge uses Blue `#194CE8`, and light TopNav items use Blue `#225BFF` / `#194CE8`; these palette-first pairs clear normal-text AA. Consumers that need the former appearance can extend `butterTheme` and override the affected color, syntax, shadow, and component values with their previous values. The CLI template ships the same private palette request, receipt, and runtime-sized references. (#7672)

@rubyycheung
