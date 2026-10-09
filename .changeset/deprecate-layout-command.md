---
'@astryxdesign/cli': patch
---

[feat] Deprecate the `astryx layout` command group

The `astryx layout` command group (`expand`, `check`, `grammar`) is deprecated.
Use `astryx build` to choose the template to start from, `astryx template` to
scaffold it, and `astryx docs layout` for layout guidance.

In human mode each invocation prints a stderr warning naming the replacement.
In JSON mode the response envelope carries machine-readable deprecation metadata
in its `meta` field. Canonical stdout, exit codes, and the `layout.expand` /
`layout.check` / `layout.grammar` response schemas are unchanged.

Deprecation lifecycle (`spec:AST-017` FR28, FR31) — removal only in a later minor whose frozen manifest carries both ids of a pair:

- deprecation `DEP-0006` / cleanup `CLN-0006` — `astryx layout` command group (`expand`, `check`, `grammar`)

@josephfarina
