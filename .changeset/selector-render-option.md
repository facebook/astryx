---
'@xds/core': minor
'@xds/cli': patch
---

`XDSSelector` and `XDSMultiSelector` now use the `renderOption` prop for custom option rendering. The previous function-as-children option renderer has been removed while the package is still prerelease.

`xds upgrade` includes `migrate-selector-children-to-render-option`, which moves `<XDSSelector>{option => ...}</XDSSelector>`, `<XDSMultiSelector>{option => ...}</XDSMultiSelector>`, and explicit `children={...}` option renderers to `renderOption={...}`.
