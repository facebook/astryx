---
'@astryxdesign/cli': minor
---

[breaking] The export-name findings `astryx doctor integration validate` has listed in its `publicImports` report since 0.7.3 are now warnings, so `astryx integration check --strict` fails on them: `component_import_missing_name`, `example_import_missing_name`, `template_import_missing_name` and `template_no_default_export`. `doctor integration validate` and a plain `integration check` keep their exit codes. To keep a build green, fix each finding the 0.7.3 report lists before upgrading.

@josephfarina
