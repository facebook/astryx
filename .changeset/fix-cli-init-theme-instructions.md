---
'@astryxdesign/cli': patch
---

[fix] align `astryx init` theme instructions with the runtime built-theme recommendation (#3080)
@cixzhang

`astryx init` now points users at the pre-built theme path (`@astryxdesign/theme-neutral/built` + `theme.css`) and the base CSS imports, matching the runtime `<Theme>` console guidance, instead of the slower runtime style-injection import that left apps unstyled.
