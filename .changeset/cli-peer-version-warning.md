---
'@astryxdesign/cli': patch
---

[fix] The CLI now warns when a project's integration declares an `@astryxdesign/cli` peer range the running CLI is outside of. `astryx doctor` and `astryx doctor integration validate` report a `cli_peer_version` warning naming the package, the range and the running version, and everyday commands print the one-line integration nudge for that package. Below the range the warning gives the project's install command for a newer CLI; above it, it asks for a release of the package that supports this CLI. Exit codes do not change.

@josephfarina
