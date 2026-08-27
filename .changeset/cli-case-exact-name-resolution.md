---
'@astryxdesign/cli': patch
---

[fix] Component and hook names resolve case-exactly on macOS and Windows, matching Linux

`findComponentReadme`, `findComponentSource` and `findHookDoc` probed candidate
paths with `fs.existsSync`, which answers through the filesystem's own case
folding. On a case-insensitive filesystem `astryx component button` resolved to
`Button` instead of reporting an unknown component with suggestions, and
`findHookDoc(core, 'mediaquery')` returned `.../hooks/useMediaquery.doc.mjs` — a
spelling that exists nowhere, and that breaks any consumer reading it on Linux.
The probes now verify each path segment against its parent's real directory
listing, so these component and hook lookups resolve the same names to the
same real paths on every host. The
deliberate case-insensitive hook lookup is unchanged; it now returns the file's
true casing.

@cixzhang
