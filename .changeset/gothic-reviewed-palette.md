---
'@astryxdesign/theme-gothic': patch
'@astryxdesign/cli': patch
---

[feat] Keep Gothic's released flat `gothicPalettes` compatibility export unchanged while moving the maintained dark theme to a reproducible generated palette and named stop mappings. The card changes from `#1A1D20` to `#191D20`; Gray background and border from `#3D4248` / `#5D646B` to `#3E454B` / `#5E676E`; syntax comment and punctuation from `#6B7079` / `#7A8290` to `#7E8791` / `#7E8791`; and diff backgrounds from `#081408` / `#1E0A0A` to `#071607` / `#220806`. Success, warning, and error inset rings move from `#87B06A50` / `#D6B56A50` / `#D4485150` to `#869B7250` / `#D3C49050` / `#C6A6A250`. Yellow text moves from `#6C5010` to `#573F0B`, and Pink text from `#71223C` to `#5C182F`; both darker named stops clear 4.5:1 on their categorical surfaces. Consumers that need the former appearance can extend `gothicTheme` and override these color, syntax, shadow, and component tokens with their previous values. The CLI template ships the same request, receipt, and runtime-sized references. (#7670)

@rubyycheung
