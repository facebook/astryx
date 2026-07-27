---
'@astryxdesign/cli': patch
---

[fix] Type `detectPackageManager` honestly so `astryx doctor`'s "no lockfile" branch is reachable

`detectPackageManager` returns `'npx'` as the sentinel for "nothing detected", but its return type only listed `'yarn' | 'pnpm' | 'bun' | 'npm'`. Type-checkers therefore treated `doctor`'s `pm !== 'npx'` guard as a dead comparison — the "No lockfile detected — defaulting to npm/npx" message looked unreachable and was at risk of being "cleaned up". The return type is now `PackageManager | 'npx'` and detection narrows via a shared type predicate, so the guard is honest and the branch is preserved.

@josephfarina
