---
'@astryxdesign/core': patch
---

[feat] Icon: add an optional `label` prop for the accessible name. Setting it makes a standalone icon meaningful (`role="img"` + `aria-label`, no `aria-hidden`), collapsing the old three-attribute dance into one prop; omitting it (or passing `''`) keeps the decorative default (`aria-hidden`).
@cixzhang
