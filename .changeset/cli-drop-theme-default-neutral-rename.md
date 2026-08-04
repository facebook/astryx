---
'@astryxdesign/cli': patch
---

[fix] Remove the `@xds/theme-default` → `@astryxdesign/theme-neutral` collapse from the v0.1.0 upgrade codemods (module-specifiers, css-surfaces, and declare-module). `theme-default` was dropped at the v0.1.0 scope move, so no v0.1.x consumer imported it — the collapse was dead and could rewrite unrelated source (including `@xds/theme-default/theme.css` CSS imports) to a `@astryxdesign/theme-neutral` package the app never declared. The `@xds/theme-daily` → `theme-neutral` collapse (and its `defaultTheme` → `neutralTheme` export remap) is unchanged.
@ejhammond
