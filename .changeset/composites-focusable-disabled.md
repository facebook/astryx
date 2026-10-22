---
'@astryxdesign/core': patch
---

[fix] Disabled TreeList rows' expand toggle and action button, disabled Pagination dots and disabled Calendar days no longer render the native `disabled` attribute. Each exposes `aria-disabled="true"` instead, so a disabled Calendar day or Pagination dot can take focus and be announced as disabled, while clicks, Enter and Space still do nothing and arrow keys still skip disabled days as before. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2). No API changes.

@cixzhang
