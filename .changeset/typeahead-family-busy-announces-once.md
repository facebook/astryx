---
'@astryxdesign/core': patch
---

[fix] `ComplexSelector`, `Typeahead`, `Tokenizer` and a directly used `BaseTypeahead` announce their busy start ("Loading") once, politely, through the shared announcement channel, and the Spinner they show while busy or while a search is in flight is no longer a live region (`spec:AST-086` FR6, FR8): ComplexSelector's is hidden from assistive technology, and the search Spinner of Typeahead, Tokenizer and BaseTypeahead stays named as an image ("Loading") so the search's busy feedback keeps its name. Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip, and it was a second owner beside the control's `aria-busy`. Inside an open modal dialog the announcement goes to a status region in the dialog. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the control's `aria-busy`, or find the search Spinner with `getByRole('img', {name: 'Loading'})`. (#7930)

@cixzhang
