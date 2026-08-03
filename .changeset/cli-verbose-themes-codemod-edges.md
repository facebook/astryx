---
'@astryxdesign/cli': patch
---

[fix] cli — rename the `search`/`build` verbose flag to `--verbose`, resync the bundled themes, and fix `unwrap-authoring-factories` edge cases (#4639)

- `astryx search`/`build` verbose output was unreachable: the boolean `--detail` flag collided with the root program's value-taking `--detail <level>`, so `search button --detail` errored `argument missing`. The boolean is now `--verbose` (the global `--detail <level>` is unchanged).
- The themes bundled for `astryx theme add` had drifted from source — the `neutral` bundle was missing a WCAG AA light-mode `text-secondary` contrast fix and a StatusDot color block, so `astryx theme add neutral` scaffolded a theme below AA. All bundles are regenerated to match source, guarded by a new drift test.
- The `unwrap-authoring-factories` upgrade codemod produced broken output for a shorthand `type` property (emitted `{'component'}`) and for no-argument factory calls (left a call referencing the just-removed import). Both now emit the correct plain object.

@josephfarina
