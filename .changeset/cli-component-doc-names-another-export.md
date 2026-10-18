---
'@astryxdesign/cli': patch
---

[feat] An integration component doc can name a differently named export of the file beside it: when `Slides.tsx` exports `AcmeCarousel` and nothing named `Slides`, `Slides.doc.mjs` can set `name: 'AcmeCarousel'`, and a kebab-case `acme-widget.doc.mjs` can name `AcmeWidget`. `component --list`, `component <Name>`, `search`, `swizzle`, the `doctor integration` checks and `integration verify` know the component by that name, and its file name still opens it. A name that Core or another doc's file already has stays theirs on every surface unless `--package` names the integration. Docs and sources are read without running them; a doc named after its file, or beside a file that exports its own name, reads exactly as before.

@josephfarina
