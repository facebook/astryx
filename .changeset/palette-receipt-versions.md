---
'@astryxdesign/cli': patch
---

[feat] `astryx theme palette generate` receipts now name the generator implementation (`generatorVersion: 'palette-generator-v1'`) and the format of the candidate bytes they hash (`candidateFormatVersion`: `'palette-typescript-v1'` for a `.ts` output, `'palette-json-v1'` for a `.json` output or a printed candidate). `candidateSha256` and every other receipt field keep their meaning, values, and order, so existing readers keep working.

@rubyycheung
