---
'@astryxdesign/core': patch
---

[fix] `@astryxdesign/core/theme/syntax` is importable from a server component again: the presets are data, not client references.

The subpath's barrel carried `'use client'`, and it is the only entry point for the syntax module. React therefore replaced *every* export with a client reference for a server importer — including `dracula`, `oneLight`, `allSyntaxPresets`, `syntaxTokenDefaults` and `defineSyntaxTheme`, none of which need a boundary. Reading a preset in a Next.js server module (deriving a code-block ground, emitting theme CSS at build time) got a proxy instead of data, so `preset.tokens` was `undefined` and the failure surfaced far from its cause — the same import under plain Node worked perfectly.

The directive now sits only on `SyntaxTheme.tsx`, the provider that actually needs it, so `SyntaxTheme` and `useSyntaxTheme` keep their client boundary while the data exports resolve as data. No API change.

@cixzhang
