---
'@astryxdesign/cli': patch
---

[fix] `astryx integration verify` works on npm 8 for a scoped package: npm 8 names the tarball `@scope/name-1.0.0.tgz` in its pack output but writes `scope-name-1.0.0.tgz`, so verify reads the file npm wrote instead of failing to find it. (#7933)

@josephfarina
