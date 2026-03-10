---
'@xds/core': patch
'@xds/cli': patch
'@xds/theme-default': patch
'@xds/theme-neutral': patch
---

v0.0.3 release — packaging and theming improvements for CDN consumers.

- Bundle StyleX runtime — consumers no longer need @stylexjs/stylex as a peer dependency (#545)
- Add stable token export path at @xds/core/tokens (#544)
- Replace null style overrides with explicit values, add lint rule (#547)
- Fix theme packages to produce proper JS/TS module output via tsup (#541)
- Sync package.json exports map
- Add verify-exports CI check (#537)
