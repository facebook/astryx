---
'@astryxdesign/cli': patch
---

[fix] A package that ships a theme or a doc section `id` needs `@astryxdesign/cli` 0.6.4, not 0.7.0.

Published 0.6.4 reads typed theme descriptors and section ids; 0.6.3 rejects both and hides the package's themes or doc topics. The 0.6.5 notes said a stable CLI before 0.7.0 rejects them, so `integration add theme` wrote `"@astryxdesign/cli": ">=0.7.0"`, a range no released CLI satisfies, and `integration verify` failed a theme or section-id package whose CLI peer started at 0.6.4. `integration add theme` now writes `">=0.6.4"`, marked optional, and `integration verify` accepts it for themes and section ids. A template that sets `replaces` or `keywords` still needs `">=0.7.0"`.

@josephfarina
