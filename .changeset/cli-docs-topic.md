---
'@astryxdesign/cli': patch
---

[feat] Read the CLI's docs as a tree, one level at a time. (#6498, #6626)

`astryx docs cli` lists the CLI's guides and reference. `astryx docs cli/commands` lists every command, `astryx docs cli/api` lists the API's functions, schemas, and enums, and a route such as `astryx docs cli/api/functions/search` prints one doc. `--json` returns `docs.node` for a namespace or typed doc, identified by its doc identity (a generated level has `id: null`). The text of `astryx docs` lists the docs tree's namespaces first; its `--json` keeps `data` as the topic list and adds them in `meta.namespaces`. Every command, API function, schema, and enum doc the CLI ships declares the `namespace` that reads it: `astryx doctor` fails when one has none or names one nothing reads, and warns when one has no route in the tree.

@josephfarina
