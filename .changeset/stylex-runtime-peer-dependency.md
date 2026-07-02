---
'@astryxdesign/core': patch
---

[chore] Move `@stylexjs/stylex` from `dependencies` to a required `peerDependency` (`^0.18.3`). A consumer who authors their own StyleX now shares a single runtime with astryx — resolution dedupes to their own install in both browser and Node — instead of silently getting a second copy on version drift. An incompatible StyleX version is now flagged at install (npm errors, pnpm/yarn warn) instead of resolving silently. Consumers who don't author StyleX are unaffected: the runtime is still required to render astryx components and is auto-installed by npm 7+ and pnpm.

@imdreamrunner
