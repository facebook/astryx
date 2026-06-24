---
'@astryxdesign/cli': patch
---

[fix] `theme build` generates valid bare type imports (IconRegistry/DefinedTheme)
@ejhammond

`astryx theme build` emitted `.d.ts` files importing `XDSIconRegistry` /
`XDSDefinedTheme` from `@xds/core`, but those aliases were removed — the
generated types failed to resolve. Generate `IconRegistry` / `DefinedTheme`
(the bare names `@xds/core` now exports) instead.
