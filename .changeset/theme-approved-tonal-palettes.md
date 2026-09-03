---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] add approved tonal-palette metadata to the theme contract

Themes can now attach a complete light tonal ramp and an optional complete dark
ramp with `defineTonalPalettes()` and `defineTheme({palettes})`. Numeric keys are
nominal stop labels from 0 through 100, ordered from darker to lighter in both
light- and dark-mode ramps. They identify approved palette entries rather than
guaranteeing exact measured HCT coordinates. Palette metadata survives source
theme extension during authoring. Production builds exclude it from the default
runtime module and emit one palette artifact set as `.palette.js`,
`.palette.json`, and `.palette.d.ts` instead of generating CSS variables or
making every consumer download the full ramps. This gives agents and tooling one
discoverable color reference while keeping semantic tokens as the preferred
component API and explicit theme colors stable when palette metadata changes.

The CLI theme template and theme guide now instruct authors to choose semantic
tokens first, use the palette to select or verify explicit theme colors, and
document intentional deviations when an approved stop does not satisfy the
requirement.

@rubyycheung
