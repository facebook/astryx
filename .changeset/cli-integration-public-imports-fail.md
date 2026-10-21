---
'@astryxdesign/cli': minor
---

[breaking] The public-import findings `astryx doctor integration validate` has listed as notes since 0.7.3 are now warnings, so `astryx integration check --strict` fails on them: `component_import_not_exported`, `component_import_other_package`, `example_import_not_exported`, `template_import_not_exported`, `template_import_outside_root` and `template_private_import`. `doctor integration validate` and a plain `integration check` keep their exit codes. To keep a build green, fix each note 0.7.3 lists before upgrading.

@josephfarina
