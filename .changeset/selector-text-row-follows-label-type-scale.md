---
'@astryxdesign/core': patch
---

[fix] Selector's one-line trigger matches its size token when the theme's spacing scale is larger than its text: the trigger's text row now follows the label type scale instead of `--spacing-5`, so extra `renderValue` lines also grow by one label-text line.
@imdreamrunner
