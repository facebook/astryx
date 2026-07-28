---
'@astryxdesign/core': patch
---

[fix] Export the `BaseProps` type through the `@astryxdesign/core/BaseProps` subpath. Previously it was only reachable through the package barrel, so the `import type {BaseProps} from '@astryxdesign/core/BaseProps'` specifier that `astryx swizzle` generates failed to resolve (#4091).

@cixzhang
