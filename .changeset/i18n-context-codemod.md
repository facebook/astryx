---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` runs `migrate-internationalization-context`, which rewrites `<InternationalizationContext value={…}>` (or its `.Provider`) to `<InternationalizationProvider locale dir messages overrides>`: a variable maps field by field, an inline object literal key by key, and every rewrite carries a TODO for the value's `translate`, which has no provider input (a literal's `translate` key is kept beside it). Any other value — a call, a spread into a literal, a conditional — is left unchanged behind a TODO saying why. It rewrites JSX whose name resolves, unshadowed, to an Astryx import (named, aliased, or namespace), reuses the file's own provider import name, and leaves a reader of the context alone.

@vjeux
