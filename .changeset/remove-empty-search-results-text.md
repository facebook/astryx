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
`astryx upgrade` runs `rename-empty-search-results-text`. It renames the prop on the three components when the element has no spread, and the key on `ChatComposerInput` trigger objects written in `triggers` or held in a same-file `const` when the object has no spread or computed key. Where `emptySearchText` is already set to a value that is never nullish (a literal, a boolean, any unary but `void`, any binary or update expression, a `||`/`??` whose right side is such a value, an `&&`, conditional, or sequence built only from such values) the old entry is dropped; where it is always nullish (`null`, `undefined`, `void`, or a conditional/`||`/`??` built only from those) the old value takes its place; where it may be nullish the old value becomes its `??` fallback (an always-nullish `?? null` / `?? undefined` default on the new value is dropped first, so `x ?? null` becomes `x ?? old`), so the written code never carries a `??` TypeScript rejects. Everything it cannot prove gets a TODO instead of an edit: an element with a spread, a trigger object with a spread or computed key, a `triggers` value or spread object the file does not build (imported, forwarded props, a call, an object that itself spreads something — including a `ChatComposerInput` that spreads a props object whose `triggers` it cannot read, unless its own `triggers` follows the spread), an object typed only through `import type {ChatComposerTrigger}`, and any other `emptySearchResultsText` object key in a file that imports from core, because after the removal the type checker will not notice the old key.