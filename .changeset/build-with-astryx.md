---
'@astryxdesign/build': patch
---

[breaking] Rename Next.js helper `withXDS` to `withAstryx`
@ejhammond

The Next.js configuration wrapper is renamed `withXDS` -> `withAstryx`
(exported from `@astryxdesign/build/next`). Update your `next.config.mjs`:
`import {withAstryx} from '@astryxdesign/build/next'`. Part of removing xds
naming from the public API.
