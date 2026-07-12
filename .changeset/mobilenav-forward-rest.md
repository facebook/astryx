---
'@astryxdesign/core': patch
---

[fix] MobileNav forwards pass-through attributes and applies consumer className/style

MobileNav declared `BaseProps` but silently discarded `className`/`style` (destructured to unused vars) and dropped every other pass-through attribute (`id`, `aria-*`, `data-*` beyond `data-testid`, event handlers). It now merges `className`/`style` and spreads the remaining props onto the `<dialog>`, and composes a consumer `onClick` with the backdrop-dismiss handler via `composeEventHandlers`.
@cixzhang
