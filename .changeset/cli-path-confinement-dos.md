---
'@astryxdesign/cli': patch
---

[fix] cli — confine user-controlled file paths, close DoS vectors, and repair paths broken by the authoring reorg (#4637)

- `theme build --out`/`<file>`, the `validate-integration` manifest roots (`components`/`templates`/`codemods`), and `layout --file` are now confined with `assertWithin`. An escaping integration root reports a validation issue instead of importing and executing files outside the package; `layout --file` is also size-capped (5 MB) and rejects non-files, so a stream like `/dev/zero` can't exhaust memory.
- Fuzzy-match (Levenshtein), the layout value parser, and the layout expander gained bounds — a very long search query, a deeply nested attribute value, and a huge repeat count (`Box*999999999`) can no longer spin the CPU, blow the stack, or exhaust the heap.
- Docs topic lookup uses a null-prototype map so `__proto__`/`constructor` as a topic name can't bypass the unknown-topic guard. The shipped getting-started docs and the sandbox registry generator point at the current CLI source path again (both broke in the authoring reorg).

@josephfarina
