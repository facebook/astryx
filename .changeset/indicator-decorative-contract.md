---
'@astryxdesign/core': patch
---

[fix] Indicator: a caller can no longer switch off the decorative contract. All three indicators dropped a consumer-supplied `aria-hidden`, `role` and `aria-label` instead of forwarding them, so `<CheckIndicator aria-hidden="false" />` no longer un-hides a visual whose accessible name belongs to the control that owns it — which got that control announced twice. Ordinary props (`data-*`, `id`, handlers, styling) still forward unchanged.

Fixes #4918.

@cixzhang
