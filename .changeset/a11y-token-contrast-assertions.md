---
'@astryxdesign/core': patch
---

[fix] theme: guarantee WCAG contrast for generated color token pairs — text-on-surface pairs are asserted at >= 4.5:1 and non-text UI pairs at >= 3:1 (WCAG 1.4.3/1.4.11), with `--color-border-emphasized` tone-bumped in generation until it clears 3:1 against the generated surface
@bhamodi
