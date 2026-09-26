---
'@astryxdesign/cli': patch
---

[fix] `astryx integration pack --check` now checks the tarball when a `prepack`, `prepare`, or `postpack` script prints to stdout. Before, any lifecycle output made the check fail with "npm pack produced unparseable JSON output" before it looked at the tarball. A failing lifecycle script still fails the check, and its output stays in the `pack_failed` message.

@josephfarina
