---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Themes can follow the reader's text size on iOS. With `typography: {dynamicType: true}` in `defineTheme`, Safari on iPhone and iPad scales the theme's font sizes with the size the reader picked in Settings (Display & Text Size, then Larger Text), each size on the curve of the iOS text style it plays: body text like Body, `heading-1` like Title 1, display text like Large Title. At the default size every font size is the theme's own; spacing, radius, line-height ratios and the root font size never change, and other browsers are unaffected. On iOS the root `Theme` also writes the reader's category on `<html data-astryx-text-size>` (`xs` to `xxxl`, then `ax1` to `ax5` for the accessibility sizes), so a layout can react to the accessibility sizes. `astryx docs typography/type-scale` and the theme template describe the option.

@vjeux
