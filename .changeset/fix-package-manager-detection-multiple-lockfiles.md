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

An explicit `packageManager` declaration is authoritative even when the
project also contains one or several lockfiles. Without a declaration, a
single lockfile remains decisive. When several lockfiles sit in one directory,
the tie is broken only from other evidence the project owns: a committed
package-manager config file (`pnpm-workspace.yaml`, `.yarnrc.yml`,
`bunfig.toml`). A stray `install` drops a lockfile; it writes none of those.

The runner (`npm_config_user_agent`) deliberately does NOT break that tie. An
agent handed the wrong `yarn astryx` line runs the CLI through yarn, so the
runner agrees with the mistake and regenerating agent docs writes the wrong
line again — the failure reproduces itself. The same holds for an installed
binary invoked from that shell. Both now have regressions that start from the
wrong line.

When nothing project-owned decides it, the CLI does not guess.
`detectPackageManager` returns the neutral `npx`, which is correct under every
package manager, and the new `explainPackageManager` reports `ambiguous` with
the tied candidates. `astryx doctor` turns that into a FAIL naming the
directory and the fix — add a `packageManager` field, or delete the lockfile
that does not belong. It is the refusal `findConfigPath` already makes for
coexisting config files.

@josephfarina
