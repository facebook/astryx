---
'@astryxdesign/core': patch
---

[chore] Re-add `@stylexjs/stylex` to `dependencies` (kept in `peerDependencies`) so the StyleX runtime is present for every consumer. A prior change moved it to a peer-only declaration, but neither Yarn 1 nor Yarn Berry auto-installs peer dependencies, which left the runtime absent for Yarn consumers (a hard render failure, since every component calls `stylex.props()`). Declaring it in both blocks guarantees presence on all package managers while keeping the `peerDependencies` range as the version guardrail and the dedupe path to a single shared runtime for consumers who author their own StyleX.

@imdreamrunner
