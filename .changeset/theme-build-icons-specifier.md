---
'@astryxdesign/cli': patch
---

[fix] cli: add `theme build --icons-specifier` so the generated module's icon import can be fully specified (#4620)

The generated theme module imports the icon registry rather than inlining it, because the registry holds React elements. `astryx theme build` scraped that specifier out of the TypeScript source and emitted it verbatim, so `./icons` — valid TypeScript, invalid ESM — reached the generated `.js`. Every published theme's `/built` entry therefore failed to load in Node, including under Vite SSR and Next.js Pages Router, while bundlers papered over it by guessing the extension.

No single extension is correct: the same source compiled by tsup lands at `icons.mjs` in a package with no `"type"` field and at `icons.js` in one with `"type": "module"`, and the generator runs before the compile step that produces either. The caller knows; now it can say so. Without the flag the specifier is emitted unchanged, so the default no-`--out` flow — where the neighbour is an uncompiled `icons.tsx` that only a bundler can resolve — is unaffected.

The seven theme packages now declare `--icons-specifier ./icons.mjs` in their build scripts.

@imdreamrunner
