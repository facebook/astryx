---
'@astryxdesign/core': patch
---

[fix] With a value, a `Typeahead`'s Tab stop is the value's token button, and it is now named by the field label and the value ("Fruit Apple", not just "Apple") and described by the field's description and status, so screen reader users know which field it belongs to. A clickable `Token` now passes `aria-labelledby` and `aria-describedby` to its inner button.

@cixzhang @duytbp
