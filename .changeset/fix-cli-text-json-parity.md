---
'@astryxdesign/cli': patch
---

[fix] Make every command's text output match its --json data

`upgrade --list` text now renders each codemod from the JSON result (name,
title, version, optional) instead of the API logger, with no `(undefined)`
rows. `theme targets` prints one line per target via the formatter kit's
inline layout and now shows className. `docs` list shows the package field.
A manifest-driven parity test covers the commands this PR fixes and catches
future regressions in the same family; commands with known deferred
divergences are covered by envelope and exit-code checks and have
allowlist entries that explain the gap.

@josephfarina
