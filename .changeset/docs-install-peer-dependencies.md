---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[docs] Document the `@astryxdesign/core` StyleX peer dependency — add `@stylexjs/stylex` to the Getting Started / Quick Start install commands in both READMEs, and add an `astryx init` next-steps reminder to ensure the `@stylexjs/stylex` peer dependency is met, with a pointer to `astryx doctor`. StyleX is the styling runtime every component calls, and not all package managers auto-install peers.

@imdreamrunner
