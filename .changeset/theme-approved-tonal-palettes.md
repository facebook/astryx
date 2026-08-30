---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] add approved tonal-palette metadata to the theme contract

Themes can now attach a complete light tonal ramp and an optional complete dark
ramp with `defineTonalPalettes()` and `defineTheme({palettes})`. Numeric keys
are nominal tone labels from 0 through 100, ordered from darker to lighter stops in both
light- and dark-mode ramps. They identify approved palette entries rather than
guaranteeing exact measured HCT coordinates. Palette metadata survives
theme extension and production theme builds without generating additional CSS
variables. This gives agents, audit tools, custom components, and data
visualization one discoverable color vocabulary while keeping semantic tokens
as the preferred component API.

The CLI theme template and theme guide now instruct authors to choose semantic
tokens first, use an exact approved numbered tone only when necessary, and
document its family, mode, tone, purpose, and contrast relationship rather than
inventing an approximate hex value.

@rubyycheung
