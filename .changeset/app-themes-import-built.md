---
'@astryxdesign/cli': patch
---

[feat] Apps can opt into package-managed themes with `astryx theme add <slug> --import`. The command records the theme in one generated app module with its production CSS, optional font CSS, and default slug. Use `theme remove` and `theme use` to manage that record, and pass `themes[defaultThemeSlug]` to `<Theme>`.

Plain `astryx theme add` keeps its released source-copy behavior, options, stdout, exit status, and every `theme.add` data field. It now warns that `theme eject` is the explicit source-fork command and `theme add --import` is the way to use the package-managed theme. Its machine result adds the `DEP-0005` deprecation entry; the cleanup is `CLN-0005` in a later scheduled minor.

Use `defineTheme({extends: importedTheme, ...})` for ordinary customization. `theme eject` creates an independent local fork with its descriptor. JSON callers receive `theme.app` from import, remove, and use, or `theme.eject` from eject.

Existing bundled source copies stay where they are and keep their bytes. Run `astryx upgrade --from 0.6.4 --path . --apply` to add the missing unmaintained descriptor beside each bundled copy in `src/themes`. Until then, theme commands skip those copies and `theme list` and doctor name them as unmigrated. Package integration themes keep their released complete-directory copy, including the authoring descriptor.

`ASTRYX_THEME` is no longer read. In a project with a generated app theme module, component metadata reads that record's default built theme. Without the module, the released `package.json#astryx.theme` lookup keeps its meaning. Doctor loads every recorded built module through the same theme adapter, so a broken runtime import fails `theme-owners` instead of passing.

`theme build` also writes `<out>.css.d.ts` so TypeScript accepts generated CSS imports. Check mode stays compatible with released output sets that do not have this new stub yet.

Integration themes can export built modules and stylesheets. `astryx integration add theme` creates those exports, and `integration verify` checks the exported paths against the packed package and source. Missing partner exports alone do not block packing. Every declared export must resolve; staleness is a warning for an incomplete set and an error for the complete importable module and stylesheet pair.

@josephfarina
