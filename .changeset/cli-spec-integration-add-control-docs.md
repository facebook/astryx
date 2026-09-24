---
'@astryxdesign/cli': patch
---

[fix] `astryx integration add --help` and the CLI manifest now define every control: the name format for each kind, that `--type` defaults to `page`, that `--to` takes an exact semver version, and that `--replaces` and `--extends` can't be combined. The `integrationAdd()` docs say the same. Behavior is unchanged.

@josephfarina
