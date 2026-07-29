---
'@astryxdesign/build': patch
---

[fix] Force `lexical`/`@lexical/*` to built dist in withAstryx (fixes sandbox build)

`withAstryx` applies webpack's `source` resolve condition to `@astryxdesign/*` packages so the sandbox/docsite build straight from raw TS. But a rule's `resolve.conditionNames` also governs how the _matched_ module resolves **its own** imports — so `@astryxdesign/lab/dist/RichTextEditor.js` resolved its `import 'lexical'` with the `source` condition too. `lexical` (and `@lexical/*`) ship a `source` export pointing at raw `.ts` (`./src/index.ts`), which Next's Babel cannot compile — it hits `declare` class fields and fails the `build-sandbox` job.

Adds a higher-precedence `module.rules` entry (placed first) that matches `lexical` and `@lexical/*` resources and forces the **default** conditions (`['...']`), resolving them to their built dist output regardless of which package imports them. The `@astryxdesign` `source` rule is unchanged; Astryx source builds are unaffected. Guarded by a new `next.test.mjs` regression test.
