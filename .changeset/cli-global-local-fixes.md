---
'@astryxdesign/cli': patch
---

[fix] Global and project copies of the CLI meet more predictably. A repository that builds the CLI itself, with `packages/cli` beside `packages/core`, answers with that CLI instead of failing with `ERR_VERSIONS_UNAVAILABLE`. On a cache folder shared between computers, a release install renews its lock every 10 seconds, and a lock from another computer that goes a minute without renewal is taken over, instead of blocking runs for 20 minutes. Folder names are compared without letter case on macOS and Windows, a Yarn 1 global install on Windows is recognized as a global install, and the shims npm, pnpm (including pnpm 12's), and PowerShell write are read when doctor and the reminders look for the `astryx` commands on the search path.

@josephfarina
