---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate` and `astryx integration check` now list a `cli_peer_version` note when the running CLI is outside the package's `@astryxdesign/cli` peer range, naming the package, the range and the running version. Below the range the note gives the project's commands to install a newer `@astryxdesign/core` and `@astryxdesign/cli` together (as dev dependencies in the package's own folder) and then run `astryx upgrade --from <version> --apply`. Above the range it asks for a release of an installed package that supports this CLI, or asks the author of the package in the current folder to test with this CLI and widen the range. A note fails nothing: `--strict`, `integration verify`, `doctor`, and exit codes are unchanged.

@josephfarina
