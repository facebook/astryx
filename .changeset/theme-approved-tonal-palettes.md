---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] add an authoring-only tonal-palette validator

`validateTonalPalettes()` checks light-only, dark-only, and dual-mode palette
files and returns structured errors and warnings. Palette data stays outside
`defineTheme`, runtime themes, and generic theme builds. Theme authors can use
approved palette stops to select and audit explicit theme colors without making
palette edits silently change rendered output.

The CLI theme guide and Neutral template document the same separation and keep
palette generation as a follow-up workflow.

@rubyycheung
