---
'@astryxdesign/cli': patch
---

[feat] Read the CLI's docs as a tree, one level at a time. (#6498, #6626)

`astryx docs cli` lists the CLI's guides and reference. `astryx docs cli/commands` lists every command, `astryx docs cli/api` lists the API's functions, schemas, and enums, and a route such as `astryx docs cli/api/functions/search` prints one doc. `--json` returns `docs.node` for a namespace or typed doc, and `astryx docs` lists the `cli` namespace after the topics. Every command, API function, schema, and enum doc the CLI ships declares the `namespace` that reads it, and `astryx doctor` fails when one has none, names one nothing reads, or has no route in the tree.

@josephfarina
