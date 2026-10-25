---
'@astryxdesign/core': patch
---

[fix] `Layout` no longer ships a `:has()` on the layout followed by a universal `*` selector for the padding that collapses next to a `LayoutHeader` or `LayoutFooter` without a divider. That selector shape can make a browser restyle everything inside the layout on each change within it, which costs the most in long documents. `LayoutHeader` and `LayoutFooter` now carry internal markers, and Layout's middle row reads them with sibling selectors. Rendering is unchanged in every case, including nested layouts.

@cixzhang
