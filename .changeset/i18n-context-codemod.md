---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` runs `migrate-internationalization-context`, which rewrites `<InternationalizationContext value={…}>` (or its `.Provider`) to `<InternationalizationProvider locale dir messages overrides>`: a variable maps `locale`, `direction` (as `dir`) and `messages` — the fields every context value has — and its TODO names `overrides` and `translate`, which the variable's type may lack and the provider has no input for; an inline object literal maps key by key, `overrides` included, with a TODO for `translate` (a literal's `translate` key is kept beside it). Any other value — a call, a spread into a literal, a conditional — is left unchanged behind a TODO saying why. It rewrites JSX whose name resolves, unshadowed, to an Astryx import (named, aliased, or namespace), reuses the file's own provider import name, and leaves a reader of the context alone.

@vjeux
