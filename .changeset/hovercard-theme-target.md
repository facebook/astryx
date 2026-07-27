---
'@astryxdesign/core': patch
---

[fix] HoverCard: move themeProps className to the layer container (where bg/radius/shadow live) so themes can target the visual surface. Forward consumer xstyle/className/style to the content span instead of silently dropping them.

@cixzhang
