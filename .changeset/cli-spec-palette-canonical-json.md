---
'@astryxdesign/cli': patch
---

[fix] `astryx theme palette generate` now writes candidate JSON in the canonical form the `astryx-oklch-v1` recipe pins, so a JSON candidate and the `candidateSha256` in its receipt match the recipe's reference fixtures byte for byte. Before, the `stops` array was printed on one line, which changed the bytes and the digest of every JSON candidate.

@josephfarina
