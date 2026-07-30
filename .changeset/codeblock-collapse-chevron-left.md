---
'@astryxdesign/core': patch
---

[feat] CodeBlock: move the collapse chevron to the left of the title/language label, following the leading-disclosure convention (points right `>` when collapsed, down `v` when expanded). It grows into place (width + inline margin) so it slides the title over smoothly instead of popping in and shifting the header. Respects `prefers-reduced-motion` (#4513)
@cixzhang
