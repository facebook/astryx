---
'@astryxdesign/cli': patch
---

[breaking] Rename the exported `XDSError` class to `AstryxError`
@ejhammond

The CLI's programmatic API error class is renamed `XDSError` -> `AstryxError`
(exported from `@xds/cli` + declared in its types). Consumers that catch or
reference `XDSError` from the CLI's API should switch to `AstryxError`. Part of
removing `xds` naming from the public API.
