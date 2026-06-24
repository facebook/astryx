---
'@astryxdesign/build': patch
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
'@astryxdesign/theme-default': patch
---

[chore] Rename the npm package scope from `@xds/*` to `@astryxdesign/*`
@cixzhang

All published packages move to the new `@astryxdesign` scope (e.g. `@xds/core` → `@astryxdesign/core`), along with the workspace lockfile, build/runtime scope-directory scans, and docsite slug derivation. Consumers must update their imports and dependency names. The internal ESLint plugin namespace (`@xds/*` rules) is intentionally untouched and tracked separately. Existing `@xds/*` codemods continue to target the old scope so projects still on `@xds/*` can migrate.
