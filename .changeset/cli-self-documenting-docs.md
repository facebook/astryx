---
'@astryxdesign/cli': patch
---

[feat] Add a self-documenting layer to the CLI: typed, colocated `.doc.mjs` for every command, every `@astryxdesign/cli/api` function, and every authored schema (config, integration, codemod, the response envelope, and the doc-types themselves). Adds the `FunctionDoc`, `SchemaDoc`, `CommandDoc`, and `EnumDoc` authoring types with sealed parsers.

Every command's `--help` and its `astryx manifest` entry are now built from that command's colocated `CommandDoc` via a `defineCommand` converter, so the docs and the CLI can no longer describe different things. The migration is behavior-preserving: help text, command output, error paths, and exit codes are byte-identical.

The CLI README's command, error-code, and response-type tables are now generated from the manifest and the `EnumDoc`s, correcting real drift — the error-code table listed two codes that do not exist and omitted several that do, and the command table was missing `blog`, `build`, `layout`, and `validate-integration`.

Kept honest by a drift harness (docs vs the live CLI), `check:cli-structure` (each doc-type and `api/` leaf ships its full file set), and lint rules for the CLI's layering.
@josephfarina
