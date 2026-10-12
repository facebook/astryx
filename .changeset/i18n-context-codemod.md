---
'@astryxdesign/cli': patch
---

[feat] `astryx upgrade` runs `migrate-internationalization-context`, which rewrites `<InternationalizationContext value={…}>` (or its `.Provider`) to `<InternationalizationProvider locale dir messages overrides>`: a variable maps field by field, an inline object key by key, and a `translate` key, which has no provider input, stays behind a TODO. It rewrites JSX bound to an Astryx import (named, aliased, or namespace) and adds the provider import; a file that only reads the context is left alone.

@vjeux
