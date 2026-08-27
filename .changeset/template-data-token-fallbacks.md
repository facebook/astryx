---
'@astryxdesign/cli': patch
---

[fix] Eight `var(--color-data-*, <hex>)` fallbacks in the dashboard templates named a colour their own token does not have, so the same chart series painted one colour with a theme and another without one. All eight now match the token default: `#22c55e` → `#0B991F` (categorical-green, portfolio), `#E5484D` → `#F5394F` (categorical-red, portfolio), `#008E80` → `#08A3A3` (categorical-teal, service-monitoring, cohort-funnel and data).

**Visual change.** Those series shift to the token colour in a generated template. Copy the old hex in if you were relying on it.

@cixzhang
