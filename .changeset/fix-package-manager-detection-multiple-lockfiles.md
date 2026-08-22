---
'@astryxdesign/cli': patch
---

[fix] Package-manager detection: don't let a stray lockfile decide

`detectPackageManager` checked lockfiles in a fixed order and returned the
first hit, so a directory holding more than one lockfile was resolved by array
position. `yarn.lock` is first in that array, which means a single
`yarn install` inside a pnpm project silently switches the CLI's answer to yarn
— permanently, because the stray lockfile stays on disk.

Every command the CLI prints is then wrong, including the invocation line
written into the agent-docs block, which agents copy verbatim into their own
runs.

A single lockfile still outranks everything else in its directory, unchanged.
When several are present the CLI now consults the declared `packageManager`
field, then the package manager actually running it
(`npm_config_user_agent`), and only then falls back to the fixed order.

@josephfarina
