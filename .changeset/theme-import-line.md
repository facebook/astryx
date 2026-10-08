---
'@astryxdesign/cli': patch
---

[fix] Wherever the CLI shows the `<Theme>` wrapper, it now also shows where `Theme` comes from: `import {Theme} from '@astryxdesign/core'`. This covers the `astryx init` next steps, `theme add` and `theme build` output, the doctor fix for an unimported theme module, `build` help, and the theme guides.

@josephfarina
