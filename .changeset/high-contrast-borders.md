---
'@astryxdesign/core': patch
---

[fix] theme: `color.contrast: 'high'` now strengthens border tokens too — the emphasized border tone is pulled toward mid-scale (stronger against both light and dark surfaces) and the subtle hairline's alpha is doubled, so structural boundaries stay perceivable in high-contrast themes instead of only text/icons changing. (#4529)
@ernestt
