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
Rename `emptySearchResultsText` to `emptySearchText`. Where both are set, delete the old one: `emptySearchText` already won.

Codemod:
`astryx upgrade` runs `rename-empty-search-results-text`. It renames the prop on the three components and the key on trigger objects written in `triggers`, held in a same-file `const`, or typed as `ChatComposerTrigger`. A trigger object with a spread or a computed key gets a TODO instead, because renaming could change which value wins.
