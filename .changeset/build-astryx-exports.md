---
'@astryxdesign/build': patch
---

[breaking] Rename `@xds/build` exports off the xds name
@ejhammond

The Vite integration's public exports are renamed: `xdsStylex` -> `astryxStylex`,
and the option types `XDSVitePluginOptions` / `XDSVitePluginLegacyOptions` ->
`AstryxVitePluginOptions` / `AstryxVitePluginLegacyOptions`. Update imports from
`@xds/build/vite` accordingly. Internal plugin names and the babel wrapper are
also rebranded. Part of removing `xds` naming from the public API.
