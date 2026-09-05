---
'@astryxdesign/cli': patch
---

[fix] `theme add` presents the two ways to use a theme as two complete paths, instead of mixing them into one that is wrong either way.

It printed the source import — `import { appTheme } from './themes/appTheme'` — and then said edits do not apply until the theme is rebuilt. Both halves are true, of different paths. Importing the source injects styles at runtime: edits apply on the next reload, and the generated `.css`/`.js` are never read. So the instruction sent people to rebuild artifacts nothing consumes, and taught them the build step is ceremony — which is what makes the built path fail silently later, when it is the one they are on.

The two paths are now separate, each with what it costs. Source import: simplest, edits apply on reload, server-rendered pages paint unthemed until hydration. Built CSS: present in the first paint, but edits need a rebuild, and a stale artifact is silent because it still reports as built. The script wiring is offered as part of the built path, where it belongs, rather than as a blanket instruction.

@josephfarina
