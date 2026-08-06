---
'@astryxdesign/core': patch
---

[feat] New string utilities: `graphemeLength`, `firstGrapheme`, and `truncateGraphemes` — grapheme-cluster-safe replacements for `.length`, `.charAt(0)`, and slice-based truncation on user-visible strings, built on `Intl.Segmenter` with a code-point fallback.

@AKnassa
