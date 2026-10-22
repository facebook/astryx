---
'@astryxdesign/cli': patch
---

[fix] `astryx integration check` lists the pairing, root and package.json findings without failing `--strict`; they become failures in the next minor. `astryx doctor integration validate` lists them as notes beside its issues (two docs for one component, a root reached through a symlink, a contribution file that cannot be read, a package.json without `name` or `version`, no provider ID, and a doc whose file name differs from its source only in letter case where the two still pair), each with its fix; nothing counts a note. A hidden component doc that does not pair with its source keeps the source warning it had. `astryx integration verify` still fails on a package.json npm cannot pack.

@josephfarina
