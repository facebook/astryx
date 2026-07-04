---
'@astryxdesign/core': patch
---

[fix] Skeleton: the loading placeholder is now `aria-hidden` by default (it's decorative — the surrounding region conveys the loading/busy state) and its pulse animation is disabled under `prefers-reduced-motion: reduce`. The `aria-hidden` default can be overridden by consumers (#3343).
@cixzhang
