---
'@astryxdesign/cli': patch
---

[feat] New `astryx integration check`, the CI check for an integration package's own build. It takes no package argument and checks the integration package in the current folder. It runs the four `doctor integration` checks (`validate`, `components`, `templates`, `docs`), prints each result, then a summary, and exits 1 when any of them would. `--strict` also exits 1 on any warning and on any check that did not run, such as a package with no `astryx.integration.*`: add `"typecheck": "tsc --noEmit && astryx integration check --strict"` to package.json so every build keeps the package's docs in sync. Its exit codes and JSON are a contract for the builds that run it: from this first release on, a new check, or a new failure code, joins only in a minor release named in the release notes. JSON: a new `integration.check` envelope carries each check's own envelope unchanged. Its docs say to run it in CI, so `astryx search ci` finds it. The `doctor integration` subcommands keep their exit codes; their JSON gains only additions.

@josephfarina
