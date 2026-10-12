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
`astryx upgrade` runs `rename-empty-search-results-text`. It renames the prop on the three components and the key on trigger objects written in `triggers`, held in a same-file `const`, or typed as `ChatComposerTrigger`. Where `emptySearchText` may be nullish it writes the `??` fallback. A JSX element with a spread, a trigger object with a spread or a computed key, a `triggers` value the codemod cannot read (a `useMemo`, a helper call, a non-`const`), and an object typed only through `import type {ChatComposerTrigger}` get a TODO instead of an edit: renaming could change which value wins, or the object is not proven to reach a `ChatComposerInput`. Every other `emptySearchResultsText` object key in a file that imports these components (an object spread onto a component, a trigger passed along untyped) is flagged too, and so is a spread onto `Tokenizer`, `Typeahead` or `BaseTypeahead` whose object the codemod cannot read (imported, or a wrapper's forwarded props), because after the removal the type checker will not notice the old key.
