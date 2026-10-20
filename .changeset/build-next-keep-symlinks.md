---
'@astryxdesign/build': patch
---

[fix] `withAstryx()` builds again under pnpm's default isolated layout. It no longer turns off webpack's symlink resolution, which hid each Astryx package's own dependencies (`Can't resolve 'intl-messageformat'`, `'lucide-react'`). Astryx modules are still matched by their real path, so a workspace-linked package keeps resolving its `source` entries.
@vjeux
