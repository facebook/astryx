---
'@astryxdesign/cli': patch
---

[fix] Remove the `@xds/theme-default` → `@astryxdesign/theme-neutral` rename from the v0.1.0 module-specifiers codemod. `theme-default` was dropped at the v0.1.0 scope move, so no v0.1.x consumer imported it — the rename was dead and could rewrite unrelated code to a package the app never declared. The `@xds/theme-daily` → `theme-neutral` collapse (and its `defaultTheme` → `neutralTheme` export remap) is unchanged.
@ejhammond
