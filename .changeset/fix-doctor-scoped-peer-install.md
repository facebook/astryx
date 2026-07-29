---
'@astryxdesign/cli': patch
---

[fix] `astryx doctor`'s peer-dependency check is now version-aware and names scoped packages correctly. Two problems are fixed: (1) the install hint was built with `name.split('@')[0]`, which for a scoped peer like `@stylexjs/stylex` returned an empty string, printing a bare `npm install ` with no package; and (2) the check only verified a peer was _present_, not that its installed version satisfied the declared range — so an out-of-range version (e.g. `@stylexjs/stylex@0.10.1` against a `^0.19.0` peer) was reported as satisfied. The check now flags out-of-range peers and its fix pins the required range, e.g. `npm install @stylexjs/stylex@^0.19.0`.

@imdreamrunner
