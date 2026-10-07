---
'@astryxdesign/cli': patch
---

[fix] `astryx integration pack` without `--check` now points only at `astryx integration verify`.

It used to say "Pass --check to verify the integration tarball, or run `astryx integration verify`", which sent people to the deprecated spelling. It now says that `integration pack` is now `integration verify`, and that `npm pack` builds the tarball. The error code and exit code are unchanged, and `integration pack --check` still runs the same check as before.

@josephfarina
