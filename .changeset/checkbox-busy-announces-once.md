---
'@astryxdesign/core': patch
---

[fix] `CheckboxInput` announces its busy start ("Loading") once, politely, through the shared announcement channel, and the Spinner it shows in place of the check mark while busy is hidden from assistive technology (`spec:AST-086` FR6, FR8). Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip, and it was a second owner beside the checkbox's `aria-busy`. Inside an open modal dialog the announcement goes to a status region in the dialog. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the checkbox's `aria-busy` instead.

@cixzhang
