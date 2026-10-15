---
'@astryxdesign/core': patch
---

[fix] `reset.css` no longer hides `hidden="until-found"` content with `display: none`. The browser's own rendering, `content-visibility: hidden`, now applies, so find in page and text fragment links can find the content and reveal it, as the HTML Standard specifies. Plain `hidden` elements are still `display: none`, and a browser without until-found support still hides the content with its own `[hidden]` rule.

@vjeux
