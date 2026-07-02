---
'@astryxdesign/core': patch
---

[fix] Grid no longer writes `grid-template-columns`/`grid-auto-rows` as raw inline styles. Track templates now use StyleX dynamic styles (CSS-variable indirection), so consumer `xstyle` overrides — including responsive `@media` overrides — take effect instead of being defeated by inline styles.

@thedjpetersen
