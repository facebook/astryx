---
'@astryxdesign/core': patch
---

[fix] useFocusTrap: Tab is only cancelled when focus is actually inside the trapped container. An open layer whose focus legitimately sits outside it — a listbox popup anchored to its own input, as in DateTimeInput, Typeahead, Selector and MultiSelector — no longer swallows Tab for the whole page, so keyboard users move to the next control on the first press. A trapped surface with no tabbable controls and focus on a `tabIndex={-1}` panel still keeps Tab inside it.
@cixzhang
