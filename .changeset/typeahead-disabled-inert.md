---
'@astryxdesign/core': patch
---

[fix] A `Typeahead` or `Tokenizer` disabled with a reason (`isDisabled` with `disabledMessage`) no longer opens its results from ArrowDown or a click, and no longer accepts a pick by Enter or a press, also from a list that was open before it became disabled. Escape or Tab still closes such a list.

@cixzhang @duytbp
