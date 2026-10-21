---
'@astryxdesign/cli': minor
---

[breaking] The public-import findings `astryx doctor integration validate` has listed in its `publicImports` report since 0.7.3 are now warnings, so `astryx integration check --strict` fails on them: `component_import_not_exported`, `component_import_other_package`, `example_import_not_exported`, `template_import_not_exported`, `template_import_outside_root` and `template_private_import`. `doctor integration validate` and a plain `integration check` keep their exit codes. A package.json with no `name` now reports the import check as skipped (`public_imports_skipped`), which `--strict` also fails on. To keep a build green, fix each finding the 0.7.3 report lists before upgrading.

@josephfarina
