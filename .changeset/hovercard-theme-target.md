---
'@astryxdesign/core': patch
---

[fix] HoverCard: move themeProps className to the layer container (where bg/radius/shadow live) so themes can target the visual surface. Forward consumer xstyle/className/style to that same layer container so surface customization lands next to the theme class, instead of silently dropping them.

@cixzhang
