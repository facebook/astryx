---
'@astryxdesign/cli': minor
---

[breaking] CLN-0005 removes the deprecated `DEP-0005` copy default from `theme add`.

The old contract copied theme source with `theme add <slug> [path] [--overwrite] [--package <package>]` and returned `theme.add` JSON. The `ThemeAddResponse` type and the `theme.add` response type are removed, with their `ThemeAddResponse.type`, `ThemeAddResponse.data`, and `ThemeAddResponse.meta` fields. The replacement imports the built theme with `theme add <slug> [--package <package>]` and returns `theme.app`; `--import` remains an accepted no-op. Plain `theme add` now returns `theme.app` with the owner `package` directly after `type`. Local themes carry no package.

A path after `theme add` now exits 1 with `ERR_INVALID_ARGUMENT`, and `--overwrite` exits 1 with `ERR_INVALID_OPTION`; neither writes files. To migrate a script that copied source, run `theme eject` with the same slug, path, `--overwrite`, and `--package` arguments. A script that already runs `theme add --import` keeps the same meaning and needs no change.

@josephfarina
