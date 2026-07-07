---
'@astryxdesign/cli': patch
---

[fix] Harden the v0.1.0 upgrade codemods against three cases surfaced while migrating consumer apps:

- **drop-xds-prefix-imports**: when un-prefixing an `@xds/core` import (e.g. `XDSCodeBlock` → `CodeBlock`) would collide with a same-named local binding in the file (such as a local `export function CodeBlock` wrapper), alias the import to `Astryx<Name>` and rewrite its usages instead of producing a duplicate declaration that breaks the build.
- **migrate-xds-css-surfaces**: rewrite CSS `@import` of `@xds/*` package stylesheets (both `'…'`/`"…"` and `url(…)` forms), including the `@xds/core/xds.css` → `@astryxdesign/core/astryx.css` file rename and the `theme-default`/`theme-daily` → `theme-neutral` collapse.
- **migrate-xds-module-specifiers**: when collapsing `@xds/theme-default`/`@xds/theme-daily` to `@astryxdesign/theme-neutral`, remap the `defaultTheme` export to `neutralTheme`, aliasing back to the original local name (`neutralTheme as defaultTheme`) so downstream usages keep working.

@ejhammond
