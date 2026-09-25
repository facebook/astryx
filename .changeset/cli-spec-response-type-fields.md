---
'@astryxdesign/cli': patch
---

[docs] The response-type docs, and the CLI README table generated from them, now name the fields of the `component.detail`, `docs.index`, `search`, `build.kit`, `gap-report.file`, `theme.build`, `theme.targets`, and `integration.pack-check` responses by their JSON keys, including `parentDoc`, `hint`, `notices`, `deprecatedFor`, each gap-report delivery's fields, and the pack-check contribution identities and issue fields. The `component.detail` response type declares `parentDoc`. (#6588)

@josephfarina
