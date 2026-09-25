---
'@astryxdesign/cli': patch
---

[fix] One integration that cannot load at all (a configured package that is not installed, has no manifest or more than one, or a package being authored with two manifests) no longer takes every other integration down with it. It is reported as that package's integration issue, the other integrations keep contributing, and `astryx discover` no longer exits 1 because of it. (#6519)

@josephfarina
