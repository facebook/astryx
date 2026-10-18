---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration validate` now checks each doc an integration ships (components, templates, docs topics, themes, and their translations) against the published authoring type for its kind, with the project's own TypeScript, the way `tsc` would. Each unknown field, missing required field, or value outside its field's type is a warning that names the doc, the line, the field, and a fix; the exit code is unchanged. JSON adds `data.docTypes`. Without TypeScript the check prints one `[skip]` line instead of passing silently.

@josephfarina
