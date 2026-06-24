---
'@astryxdesign/cli': patch
---

[breaking] Read project config from `astryx.config.mjs` (was `xds.config.mjs`)
@ejhammond

The CLI now resolves its optional project config from `astryx.config.mjs`
instead of `xds.config.mjs` — a hard cut, no fallback. Consumers with an
`xds.config.mjs` must rename it to `astryx.config.mjs` (the config shape and
all fields are unchanged). Part of removing `xds` naming from the public API.
