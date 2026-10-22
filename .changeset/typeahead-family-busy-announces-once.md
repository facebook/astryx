---
'@astryxdesign/core': patch
---

[fix] `ComplexSelector`, `Typeahead`, `Tokenizer` and a directly used `BaseTypeahead` announce their busy start ("Loading") once, politely, through the shared announcement channel, and the Spinner they show while busy or while a search is in flight is hidden from assistive technology (`spec:AST-086` FR6, FR8). Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip, and it was a second owner beside the control's `aria-busy`. Inside an open modal dialog the announcement goes to a status region in the dialog. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the control's `aria-busy` instead.

@cixzhang
