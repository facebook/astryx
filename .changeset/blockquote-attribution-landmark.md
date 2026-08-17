---
'@astryxdesign/core': patch
---

[fix] Blockquote: the `cite` attribution renders as a bare `<cite>` instead of being wrapped in a `<footer>`, which was becoming a `contentinfo` document landmark. Also guards the slot with `isRenderable`, so `cite={condition && author}` no longer emits an empty `<cite>`, and wraps long unbroken words instead of overflowing.

@cixzhang
