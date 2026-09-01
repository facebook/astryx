---
'@astryxdesign/core': patch
---

[fix] AppShell: the root now clips overflow in both height modes, so a margin-collapsing child (auto) or an absolutely-positioned child (fill) can no longer escape the shell's intended height boundary and scroll the page past it.

@HelloOjasMutreja
