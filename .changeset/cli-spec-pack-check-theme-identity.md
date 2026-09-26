---
'@astryxdesign/cli': patch
---

[fix] `astryx integration pack --check` now fails when the package lifecycle changes a theme's catalog `entry` or `files` in the packed tarball. It used to compare only each theme's slug and export name, so a tarball that pointed a theme at different source still reported `packable: true`. The issue names the entry or file list that changed.

@josephfarina
