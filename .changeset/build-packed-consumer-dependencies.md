---
'@astryxdesign/build': patch
---

[fix] Keep PostCSS and Vite processing inside `@astryxdesign/build`'s declared dependency boundary (#6605)

Packed consumers no longer depend on workspace hoisting to find PostCSS helpers or CSS compatibility processors. The package now owns Autoprefixer, Browserslist, and Lightning CSS, and a clean isolated-install test exercises the published tarball's PostCSS helper and Vite output.

@cixzhang
