---
'@astryxdesign/cli': minor
---

[breaking] `astryx theme add` now records and imports an installed built theme instead of copying its source. It generates one app theme module with every added theme, its production CSS, optional font CSS, and the default slug. Use `theme remove` and `theme use` to manage that record. Import the generated module once and pass `themes[defaultThemeSlug]` to `<Theme>`.

Use `defineTheme({extends: importedTheme, ...})` for ordinary customization. The old source-copy behavior is now `astryx theme eject`, which creates an independent local fork with its descriptor. JSON callers move from `theme.add` to `theme.app` for add, remove, and use, or `theme.eject` for an eject receipt.

Existing source copies stay where they are and keep their bytes. Run `astryx upgrade --from 0.6.4 --path . --apply` to add the missing unmaintained descriptor beside each copy in `src/themes`. Until then, theme commands skip those copies and `theme list` and doctor name them as unmigrated.

`ASTRYX_THEME` is no longer read. A released `package.json#astryx.theme` value still works only when the project has no generated theme module.

Integration themes now need exported built modules and stylesheets. `astryx integration add theme` creates those exports, and `integration verify` proves they resolve from the packed package and still match source.

@josephfarina
