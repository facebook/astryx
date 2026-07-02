---
'@astryxdesign/cli': patch
---

[chore] Serialize test-suite package builds with a cross-process lock: the two build-theme test files and build-css.test.mjs each build into packages/core/dist from parallel vitest workers, and unsynchronized builds raced each other's rimraf/output, failing CI with ENOTEMPTY or an unresolvable dist/index.js (#3479)
@arham766
