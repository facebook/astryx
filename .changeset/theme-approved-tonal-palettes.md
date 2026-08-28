---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] add approved tonal-palette metadata to the theme contract

Themes can now attach complete light and dark tonal ramps with
`defineTonalPalettes()` and `defineTheme({palettes})`. Palette metadata survives
theme extension and production theme builds without generating additional CSS
variables. This gives agents, audit tools, custom components, and data
visualization one discoverable color vocabulary while keeping semantic tokens
as the preferred component API.

The CLI theme template and theme guide now instruct authors to choose semantic
tokens first, use an exact approved palette stop only when necessary, and
document its family, tone, purpose, and contrast relationship rather than
inventing an approximate hex value.

@rubyycheung
