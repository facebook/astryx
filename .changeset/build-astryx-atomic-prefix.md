---
'@astryxdesign/build': patch
---

[breaking] Default the StyleX library atomic-class prefix to `astryx` (was `xds`)
@ejhammond

`@astryxdesign/build`'s babel/Vite integrations now emit library atomic classes as
`.astryx78zum5` by default instead of `.xds78zum5` (the `libraryPrefix` /
`stylexPrefix` option default flips `xds` -> `astryx`). This is an opaque,
StyleX-generated namespace — consumers don't target these classes directly —
but it completes the removal of `xds` naming from build output. Consumers that
explicitly configured `libraryPrefix`/`stylexPrefix` are unaffected.
