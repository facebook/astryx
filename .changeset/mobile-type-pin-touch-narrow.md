---
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-neutral': patch
'@astryxdesign/theme-stone': patch
---

[feat] Touch + narrow typography (Pin model) for the 14px-base first-party themes

Under `@media (width < 1024px) and (pointer: coarse)`, neutral and chocolate
(base 14, ratio 1.2) and butter and stone (base 14, ratio 1.25) now floor
their type base to 16px and re-derive the ratio so Display 1 holds its
desktop size (1.2 -> 1.1736, 1.25 -> 1.2225). Body, label and code rise
14px -> 16px; the display tier no longer grows on phones. Desktop scales
are unchanged, and gothic, matcha and y2k (already base 16) need no rule:
their pinned ladder is their desktop ladder.

@imdreamrunner
