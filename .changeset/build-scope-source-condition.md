---
'@astryxdesign/build': patch
---

[fix] Scope the `source` resolve condition to @astryxdesign packages in withAstryx

`withAstryx` set webpack's `conditionNames` to `['source', …]` globally, which resolved *any* dependency shipping a `source` export to its raw TypeScript — not just Astryx packages. Third-party deps that ship a `source` export (e.g. `lexical`, pulled in by the new RichTextEditor lab component) were then fed untranspiled `.ts` through Next's babel and failed on syntax like `declare` class fields.

The `source` condition is now applied via a scoped **allowlist** `module.rules` entry that only matches `node_modules/@astryxdesign/*` (with `conditionNames: ['source', '...']`, so it augments rather than replaces Next's defaults). The global `config.resolve.conditionNames` is left as Next's default, so all other packages — including any future third-party dep that happens to ship a `source` export — resolve to their built output. React JSX resolution is preserved via the inherited `'...'` defaults + `react-server` condition. Astryx source builds are unaffected.

@potatowagon
