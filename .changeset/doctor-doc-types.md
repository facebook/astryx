---
'@astryxdesign/cli': patch
---

[feat] `astryx doctor integration validate` now checks every doc an integration ships under its roots (components, templates, docs topics, themes, and their translations, served or not) against the published authoring type for its kind, with the project's own TypeScript, the way `tsc` would. Each unknown field, missing required field, or value outside its field's type is a warning that names the doc, the line, the field, and a fix; the exit code is unchanged. A doc it cannot fully check, or a themes root that does not load, is listed with the reason; test fixtures under `__tests__` in the components or docs root are counted, not checked. JSON adds `data.docTypes`. Without TypeScript the check prints one `[skip]` line instead of passing silently; with a TypeScript it cannot read types with (one with no JavaScript compiler API, such as TypeScript 7), that line names the installed version. With no doc files, it says there is nothing to check.

@josephfarina
