---
'@astryxdesign/core': patch
---

[feat] AvatarStatusDot: default accessible labels per variant come from the i18n catalog instead of hardcoded English. When no explicit `label` prop is given, the dot now resolves its accessible name from `@astryx.avatarStatusDot.online` / `.away` / `.busy` (Online / Away / Busy), so screen readers always have a status meaning to announce and the strings localize like the rest of astryx (WCAG 2.1 SC 1.4.1). Explicit `label` remains the highest-precedence value; custom augmented variants keep no default and render without `role="img"`.
@gonzoblasco
