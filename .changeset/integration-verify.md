---
'@astryxdesign/cli': patch
---

[feat] `astryx integration verify` is the new name of `astryx integration pack --check`.

The check you run before publishing an integration now has a name that says what it does. `astryx integration verify` packs the package with npm, installs the tarball into a temporary app, and checks that the app sees the same components, templates, themes, docs, and codemods. It takes no flags. `astryx integration pack --check` still works as a deprecated alias: it runs the same check with the same output, JSON, and exit codes, prints a note that names `integration verify`, and shows as deprecated in help. It will be removed in a later release. The `integrationPackCheck()` API and its `integration.pack-check` JSON response do not change. With `--json`, a command group given an unknown subcommand now reports `ERR_UNKNOWN_SUBCOMMAND` and lists its subcommands, where it used to say JSON output is not supported.

@josephfarina
