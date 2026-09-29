---
'@astryxdesign/cli': patch
---

[fix] A package that ships a theme, or a doc section with an `id`, now declares the CLI that can read it.

A CLI before 0.7.0 rejects both: it cannot read the typed theme descriptors that `astryx integration add theme` writes, and it rejects a section `id`. Either way it hides the package's themes or doc topics with no warning. `astryx integration add theme` now adds `"@astryxdesign/cli": ">=0.7.0"` to `peerDependencies`, marked optional, and `astryx integration verify` fails with `themes_need_cli` or `section_ids_need_cli` when a package needs that peer range and does not declare it.

@josephfarina
