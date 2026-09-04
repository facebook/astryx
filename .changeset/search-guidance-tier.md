---
'@astryxdesign/cli': patch
---

[fix] `search` indexes a component's usage guidance, one tier below its description.

A component's best practices are where the reader's vocabulary lives. `Banner` describes itself as "a persistent message"; only its guidance says "caution", "problems", "form errors". None of those words found it, because guidance was never read — 97 core components ship guidance, and all of it was invisible to search.

Measured on the real registry, before and after: `caution`, `problems`, `sources` and `attention` each now return the component whose guidance defines them, and each returned nothing relevant before.

Guidance scores 45, below description's 50, so a component that IS the answer still outranks one whose advice merely mentions the term — the ordering that put `Toast` behind `Card`, `Dialog` and `Item` on "notification".

It sits deliberately BELOW `MIN_TOKEN_SCORE`, so it never counts as a matched concept in a multi-word query. That is not a detail: letting it count was measured moving `nested menu` from SideNav to List, and `explain why a field is required` from Field to TextInput — a component whose guidance happens to mention the other word displacing the one that is the answer. Breadth is not relevance, the same reason `weakKeywords` are capped. With the floor left at 50, a 28-query sweep shows zero top-result changes and zero regressions, while the single-word gains above are kept.

@josephfarina
