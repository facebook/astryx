---
'@astryxdesign/cli': minor
---

[breaking] `astryx integration pack --check` is now `astryx integration verify`.

The check you run before publishing an integration has a name that says what it does. `astryx integration verify` packs the package with npm, installs the tarball into a temporary app, and checks that the app sees the same components, templates, themes, docs, and codemods. It takes no flags. `astryx integration pack` is gone, with no alias: it fails as an unknown subcommand and lists `verify`. The `integrationPackCheck()` API and its `integration.pack-check` JSON response do not change.

@josephfarina
