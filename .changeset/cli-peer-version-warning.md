---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate` and `astryx integration check` now list a `cli_peer_version` note when the running CLI is outside the package's `@astryxdesign/cli` peer range, naming the package, the range and the running version. For an installed package, below the range the note gives the install command for a newer CLI, and above it the note asks for a release of the package that supports this CLI; for the package in the current folder, above the range it asks its author to test with this CLI and widen the range. A note fails nothing: `--strict`, `integration verify`, `doctor`, and exit codes are unchanged.

@josephfarina
