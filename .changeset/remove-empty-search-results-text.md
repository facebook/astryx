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
Rename `emptySearchResultsText` to `emptySearchText`. Where both are set and `emptySearchText` is never null or undefined, delete the old one: it already won. Where `emptySearchText` may be null or undefined (a forwarded optional prop, for example), 0.6.x fell back to the old value, so write `emptySearchText={newValue ?? oldValue}`.

Codemod:
`astryx upgrade` runs `rename-empty-search-results-text`. It renames the prop on the three components when the element has no spread, and the key on `ChatComposerInput` trigger objects written in `triggers` or held in a same-file `const` when the object has no spread or computed key. Where `emptySearchText` is already set to a value that is never nullish the old entry is dropped; where it may be nullish the old value becomes its `??` fallback. Everything it cannot prove gets a TODO instead of an edit: an element with a spread, a trigger object with a spread or computed key, a `triggers` value or spread object the file does not build (imported, forwarded props, a call, an object that itself spreads something — including a `ChatComposerInput` that spreads props without its own `triggers` after them), an object typed only through `import type {ChatComposerTrigger}`, and any other `emptySearchResultsText` object key in a file that imports from core, because after the removal the type checker will not notice the old key.