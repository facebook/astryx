---
'@astryxdesign/cli': minor
---

[breaking] Remove the `astryx layout` command and its `expand`, `check`, and `grammar` subcommands. `@astryxdesign/cli/api` drops the `layoutExpand`, `layoutCheck`, and `layoutGrammar` functions, the `LayoutExpandResponse`, `LayoutCheckResponse`, and `LayoutGrammarResponse` types, and the `layout.expand`, `layout.check`, and `layout.grammar` response types.

**There is no replacement.** No codemod can rewrite a `layout` invocation into another command, so per `spec:AST-017` FR8 these are the concrete migration instructions:

- `astryx layout expand '<expr>' <path>` — scaffold from a page template instead. `astryx build "<what you are building>"` names the closest template, `astryx template <name> <path>` writes it, and `astryx template <name> --skeleton` prints a layout reference.
- `astryx layout check '<expr>'` and `astryx layout grammar` — no CLI equivalent; nothing replaces them.
- Programmatic callers can move to the XLE engine itself, which is unchanged and still published as `@astryxdesign/cli/xle` (`expandExpression`, `checkExpression`, `buildRegistry`). It is browser-safe and takes its registry and blocks as arguments instead of reading `astryx.config.mjs`.

`ERR_LAYOUT_PARSE` and `ERR_LAYOUT_INVALID` are deliberately retained: `architecture:cli-surface` INV3 makes the error-code set append-only, and both descriptions remain accurate for the `@astryxdesign/cli/xle` engine.

@josephfarina
