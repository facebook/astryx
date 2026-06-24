---
'@astryxdesign/cli': patch
---

[breaking] Rename the CLI command/bin from `xds` to `astryx`
@ejhammond

The CLI binary is now `astryx` (was `xds`); `bin/xds.mjs` is renamed to
`bin/astryx.mjs`, the dual `xds`+`astryx` bin entries collapse to a single
`astryx`, and the program/manifest name is `astryx`. Invoke the CLI as
`npx astryx <command>` (e.g. `npx astryx component Button`). The swizzle
default output dir moves from `./components/xds` to `./components/astryx`.
Consumers using `npx xds`, an `xds` npm-script alias, or the `xds` MCP server
name should switch to `astryx`. Part of removing `xds` naming from the public API.
