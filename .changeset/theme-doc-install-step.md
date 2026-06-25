---
'@astryxdesign/cli': patch
---

[docs] Add npm install step to the Theme System guide
@nynexman4464

The Quick Start section jumped straight to `import {neutralTheme} from '@astryxdesign/theme-neutral'`, which fails with `Cannot find module` for anyone who hasn't already installed the theme package. Prepend a one-line preamble + `npm install` code block, and add a short prose note above the Available Themes table pointing at the install command pattern. Reported in #3082.
