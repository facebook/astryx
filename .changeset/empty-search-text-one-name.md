---
'@astryxdesign/core': patch
---

[feat] The message a component shows when a query matched nothing is now `emptySearchText` everywhere, and it takes a `ReactNode`.

`Selector`, `MultiSelector`, and `CommandPalette` already called it `emptySearchText` and already accepted a node. `Tokenizer`, `Typeahead`, `BaseTypeahead`, and each `ChatComposerInput` trigger called it `emptySearchResultsText` and accepted only a string — so the same product could offer a "no results, create one" row in one component and not in its neighbour, and a builder who learned one had to discover the other.

Nothing breaks. The type only widens, so every existing value stays valid, and `emptySearchResultsText` keeps working exactly as released. Set both and `emptySearchText` wins, with a development warning. Migration is the name alone.

Deprecation lifecycle (`spec:AST-017` FR28, FR31) — removal only in a later minor whose frozen manifest carries both ids of a pair:

- deprecation `DEP-0001` / cleanup `CLN-0001` — `Tokenizer.emptySearchResultsText`
- deprecation `DEP-0002` / cleanup `CLN-0002` — `Typeahead.emptySearchResultsText`
- deprecation `DEP-0003` / cleanup `CLN-0003` — `BaseTypeahead.emptySearchResultsText`
- deprecation `DEP-0004` / cleanup `CLN-0004` — `ChatComposerTrigger.emptySearchResultsText`

@cixzhang
