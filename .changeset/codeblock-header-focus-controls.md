---
'@astryxdesign/core': patch
---

[fix] CodeBlock: complete the collapsible header's disclosure pattern. It now shows the standard accent focus ring on `:focus-visible` — previously it defined no focus style and fell back to the browser's default outline, unlike the system's other disclosure controls (Collapsible, TabMenu) — and links to the code region it shows/hides via `aria-controls` (the header already exposed `aria-expanded`). The region stays mounted when collapsed (CSS grid animation), so `aria-controls` is an always-resolvable reference. (#3723)
@bhamodi
