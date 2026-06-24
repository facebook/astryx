---
'@astryxdesign/core': patch
---

[breaking] Rename theme-token helpers off the XDS name
@ejhammond

The `@xds/core/theme` token helpers are renamed: `resolveXDSThemeTokens` ->
`resolveThemeTokens`, `resolveXDSThemeToken` -> `resolveThemeToken`,
`xdsTokenVar` -> `tokenVar`, `xdsTokenVars` -> `tokenVars`, and the option types
`ResolveXDSThemeToken(s)Options` -> `ResolveThemeToken(s)Options`. Update imports
from `@xds/core/theme` / `@xds/core/theme/tokens`. Part of removing `xds` naming
from the public API.
