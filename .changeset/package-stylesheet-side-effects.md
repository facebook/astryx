---
'@astryxdesign/richtext': patch
---

[fix] `@astryxdesign/richtext` (and the Lab and Charts packages) now declare their stylesheet as a side effect, so a bundler that removes side-effect-free imports keeps `import '@astryxdesign/richtext/richtext.css'` instead of dropping it and leaving the editor unstyled. JavaScript modules stay tree-shakable.

@cixzhang
