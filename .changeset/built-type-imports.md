---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor --built` no longer counts a type-only Astryx import (`import type`, `import {type X}`, `export type … from`) as Astryx use, since the build erases it.

@josephfarina
