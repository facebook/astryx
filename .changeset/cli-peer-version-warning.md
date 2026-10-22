---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor integration validate` and `astryx integration check` now list a `cli_peer_version` note when the running CLI is outside the package's `@astryxdesign/cli` peer range, naming the package, the range and the running version. Below the range the note gives the install command for a newer CLI; above it, it asks for a release of the package that supports this CLI. A note fails nothing: `--strict`, exit codes and every other check are unchanged.

@josephfarina
