---
'@astryxdesign/cli': patch
---

[feat] `integration init` creates an integration package in one command.

`astryx integration init [name]` writes or completes `package.json` with the fields `integration add` needs (name, version, and — for new packages only — an empty exports map), then adds missing dependencies as dev dependencies and installs declared ones where they are declared. After init plus the first `integration add`, `integration verify` works immediately.

An existing package without an exports map keeps it absent (INV16: adding one would make deep imports private for existing consumers); the receipt notes the gap. The Core peer is written by `integration add component|template|theme`, not by init, so doc, codemod, and agent-doc integrations never declare a Core range they do not need.

Re-running on an initialized package with satisfied deps reports unchanged and does not invoke the package manager. On install failure, package.json is rolled back. `--dry-run` previews without writing; `--no-install` skips the install step. New error code: `ERR_INSTALL_FAILED`.

`integration add theme` and `integration add doc --parent` now refuse a `peerDependencies` field that isn't an object (`ERR_INVALID_ARGUMENT`, package.json unchanged) instead of rewriting it into a corrupted object.

@josephfarina
