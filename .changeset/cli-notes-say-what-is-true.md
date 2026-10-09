---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] The setup reminder and the swizzle StyleX note say only what is true
@josephfarina

- The "run init to finish setup" reminder no longer prints where agents already have the Astryx prompt. In a git repository it looks for init's block in the agent docs from the project up to the repository root, because coding agents read every agent doc in between, so a package in a monorepo that ran `init` at its root stays quiet. This holds for every command and for the reminder printed when `@astryxdesign/core` or `@astryxdesign/cli` is installed. Running the CLI from its own source checkout, inside that checkout, prints no reminder. A project with no block in reach still gets it, and `--json` never prints it.
- `astryx swizzle` no longer says StyleX components "render unstyled (no error)" without a StyleX compiler. Importing them throws StyleX's "Unexpected 'stylex.create' call at runtime" error and the page does not render, and the note now says so.

Classification: contract-restoring. Only human-readable text changes; JSON output is unchanged.
