---
'@astryxdesign/core': patch
---

[feat] `subsetStylesheet` from `@astryxdesign/core/stylesheet` returns `astryx.css` with only the rules of the modules a production build ships, so an app that renders a few components no longer loads all of them. Pass the module files of the build's output; load the result in place of `astryx.css`. Retained rules keep their text and order, so rendered components look the same, and listing every module returns the whole file unchanged. It runs in Node.js at build time and works the same for `lab.css`, `charts.css`, and `richtext.css`. Each stylesheet now ships with a `.json` file beside it that the function reads; the stylesheets themselves are unchanged.

@vjeux
