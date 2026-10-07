---
'@astryxdesign/cli': patch
---

[feat] Keep a theme's `componentIcons` map in the module `astryx theme build` generates
@rubyycheung

The built theme module now carries the same component icon slot mappings as its source theme, including slots mapped to `null`, so passing the built theme to `<Theme>` resolves each slot the same way. A theme that extends a built theme inherits those mappings too. The map adds nothing to the generated CSS.
