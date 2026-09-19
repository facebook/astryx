---
'@astryxdesign/build': patch
---

[fix] Stop requiring packages `@astryxdesign/build` does not depend on, so the PostCSS and Vite entries work under strict installs (#6372)
@Han5991

`./postcss` required `postcss`, and `./vite` required `lightningcss` and
`browserslist`, without declaring any of them. They resolved only where the
installer hoisted a copy. Under a strict install such as Yarn Plug'n'Play, the
PostCSS entry failed to load, and the Vite entry quietly skipped its
lightningcss pass, dropping the vendor prefixes StyleX had applied.

The PostCSS entry now gives the host's postcss a CSS string to parse, so it
needs no copy of its own. The Vite entry resolves lightningcss and browserslist
from `@stylexjs/unplugin`, which depends on both, so it runs the same pass
StyleX did.
