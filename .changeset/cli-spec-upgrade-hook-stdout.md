---
'@astryxdesign/cli': patch
---

[fix] `astryx upgrade --json` now prints exactly one JSON envelope when a post-codemod hook prints output. Anything a hook's `buildCommand` writes goes to stderr, so stdout carries only the result.

@josephfarina
