---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
'@astryxdesign/theme-butter': patch
'@astryxdesign/theme-chocolate': patch
'@astryxdesign/theme-gothic': patch
'@astryxdesign/theme-stone': patch
'@astryxdesign/theme-y2k': patch
---

[fix] A `secondary` Selector, MultiSelector, or ComplexSelector now matches the theme's secondary Button: under butter, chocolate, gothic, stone, and y2k it takes that Button's border, fill, text color, and hover instead of the default borderless neutral fill, so a toolbar mixing secondary buttons and selectors reads as one set of controls. The default theme is unchanged, the selector docs now say `secondary` follows the theme's secondary Button, and themes added with the CLI get the same parity.

@cixzhang
