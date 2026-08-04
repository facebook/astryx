---
'@astryxdesign/core': patch
---

[fix] Pagination (dots variant): inactive dots now use `--color-text-secondary` instead of the translucent `--color-neutral`, meeting WCAG 1.4.11 non-text contrast (3:1) on body/surface. The active dot now renders as an outlined ring (inset accent ring with transparent fill) rather than a solid fill, so the current page is identifiable by shape and not only by color, addressing WCAG 1.4.1 Use of Color.

@gonzoblasco
