---
'@astryxdesign/core': patch
---

[feat] New string utilities: `characterCount`, `firstCharacter`, and `truncateCharacters` — replacements for `.length`, `.charAt(0)`, and slice-based truncation that measure and cut user-visible strings by whole characters, so an emoji, flag, or accented letter counts as one and never gets split. Built on `Intl.Segmenter` with a code-point fallback.

@AKnassa
