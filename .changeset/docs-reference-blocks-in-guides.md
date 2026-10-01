---
'@astryxdesign/cli': patch
---

[feat] A doc section can include another doc instead of copying it. Put a `reference` block in the section, such as `{type: 'reference', target: '@astryxdesign/cli:schema:integration', projection: {fields: ['components', 'docs']}}`, and `astryx docs` prints those two fields of the integration manifest from the schema's own doc, then the command that opens it.

A reference block includes a schema, command, function, or enum doc. `projection.fields` keeps only the named fields of a schema, and `presentation` is `full` (the default), `compact` (no code blocks), or `summary`. A reference to any other doc shows its title and summary. A read inlines the block, so `--json` still returns only the stable block kinds. `astryx doctor integration docs` fails when a block names a doc, field, or projection it cannot include, and a read marks what is missing. Links also find the CLI's authoring schemas now: `schema:integration` opens `astryx docs authoring integration`.

@josephfarina
