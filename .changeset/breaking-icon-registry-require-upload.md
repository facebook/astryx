---
'@astryxdesign/core': minor
---

[breaking] Require `upload` on complete `IconRegistry` types
@rubyycheung @cixzhang

Old usage:
A custom complete icon registry typed as `IconRegistry` that omitted the `upload` key.

Replacement:
`IconRegistry` now requires all semantic `IconName` keys, including `upload`.

Migration:
Add an `upload` entry drawn in your registry's icon style to complete icon registries typed as `IconRegistry`.

Codemod:
No `astryx upgrade` codemod applies (spec:AST-017 FR8) because icon artwork is bespoke design artwork tailored to each theme and cannot be automatically synthesized.
