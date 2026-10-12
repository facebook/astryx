---
'@astryxdesign/core': minor
---

[breaking] Remove the deprecated `emptySearchResultsText` prop. Use `emptySearchText`.
@cixzhang

CLN-0001, CLN-0002, CLN-0003, and CLN-0004 complete DEP-0001 through DEP-0004 (spec:AST-056 FR7).

Old usage:
`emptySearchResultsText` on `Tokenizer`, `Typeahead`, and `BaseTypeahead`, and the `emptySearchResultsText` key on a `ChatComposerInput` trigger.

Replacement:
`emptySearchText`, shipped in 0.6.6. It takes a `ReactNode`, so every old string value stays valid. The old name is no longer in the types and is no longer read; a JavaScript caller that still passes it sees the default empty message.

Migration:
Rename `emptySearchResultsText` to `emptySearchText`. Where both are set, keep `emptySearchText` and delete the old one.

Codemod:
`astryx upgrade` runs `rename-empty-search-results-text`, a straight rename at the JSX boundary: the prop on imported `Tokenizer`, `Typeahead`, and `BaseTypeahead` elements, and the key on trigger objects written inline in `ChatComposerInput`'s `triggers`, each renamed as written. Like every Astryx codemod it does not follow variables, helpers, spreads, wrappers, or types; where it cannot attribute the value — `emptySearchText` already set, an element with a spread, a `triggers` value not written inline, a trigger object with a spread or computed key — it leaves a TODO instead of choosing a winner. The type checker reports any literal `emptySearchResultsText` it did not reach; a value forwarded through a spread is what the TODOs are for.