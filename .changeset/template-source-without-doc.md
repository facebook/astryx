---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration validate` and `astryx integration check` now warn `source_without_template_doc` when a `.tsx` directly in an integration's templates root has no same-stem template doc, so `astryx template` would never list it. The warning names the file and the doc to add. Files in subfolders, such as helpers a template imports, and test or story files such as `stray.test.tsx` are not checked, and `integration check --strict` fails on the warning.
@josephfarina
