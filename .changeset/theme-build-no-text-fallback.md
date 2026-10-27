---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` reports a theme module that fails to load (an import it cannot resolve, or an error it throws) instead of building the theme from the text of its `defineTheme()` or default-export object; a theme module whose default export is a plain object builds as before.

@vjeux
