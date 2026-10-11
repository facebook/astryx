---
'@astryxdesign/cli': patch
---

[fix] `template` and `build` no longer guess an install command when the package manager is ambiguous. When several lockfiles are present and nothing the project declares or commits picks one, `installCommand` is `null` and the setup note names the missing packages without a command, instead of printing `pnpm add` or `npm install` and leaving a second lockfile behind. Detection now uses the CLI's shared package-manager resolution, so a declared `packageManager` field, a parent workspace's lockfile, and committed config are honored the same way as in every other command the CLI prints.

@cixzhang
