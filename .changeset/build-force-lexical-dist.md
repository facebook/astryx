---
'@astryxdesign/build': patch
---

[fix] Pin lexical/@lexical to built dist in withAstryx (fixes sandbox build)

`withAstryx` sets a global `source` resolve condition so `@astryxdesign/*` packages build straight from their raw-TS `source` export with no prebuild step (they're transpiled via `transpilePackages`). But `lexical` and every `@lexical/*` package — pulled in by `@astryxdesign/lab`'s new `RichTextEditor` — ALSO ship a `source` export pointing at raw `.ts` (`./src/index.ts`). Under the global `source` condition those resolved to untranspiled TypeScript, which Next's Babel cannot compile: it dies on `declare` class fields and fails the `build-sandbox` job.

`withAstryx` now builds a `resolve.alias` map that pins `lexical` and every installed `@lexical/*` package — including every `exports` subpath — to its prebuilt dist file, resolved via Node's own resolver (which ignores the webpack-only `source` convention and honors each package's exports-map renames). Exact-match (`<specifier>$`) aliases win over export-condition resolution regardless of which package issued the import, so lexical always comes from dist while Astryx keeps building from source. Guarded by a `next.test.mjs` regression test.

@potatowagon
