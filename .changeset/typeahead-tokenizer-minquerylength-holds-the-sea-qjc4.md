---
'@astryxdesign/core': patch
---

[feat] Typeahead + Tokenizer: minQueryLength holds the search and the menu until the query is long enough (#5385)

Also fixes a stranded loading state that predates the prop: abandoning an in-flight search — by emptying the field, by falling below the threshold, or by selecting an item while the next search is still out — bumps the search generation, which makes that search's own `finally` decline to clear the loading flag. The field kept reporting "Loading" to assistive technology until another search settled.

`hasCreate` is not gated by it. The "Create ..." entry is derived from the typed text rather than fetched for it, so it now reaches the menu through a separate internal path and is offered whatever the threshold says — the threshold exists to avoid a fetch too broad to be worth making, and creating costs no fetch. With `minQueryLength={3}`, typing `QA` offers `Create "QA"` and Enter commits it, while the search source is still never called.

One consequence worth naming: the Create entry is appended after the results are cut to `maxMenuItems`, so with `hasCreate` a full menu now shows one option more than the cap — 11 where it used to show 10. The cap bounds how many _results_ a menu shows; creating is a separate capability and is not crowded out by them.

@freddymeta
