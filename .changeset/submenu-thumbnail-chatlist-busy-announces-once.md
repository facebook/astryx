---
'@astryxdesign/core': patch
---

[fix] `DropdownMenuSubMenu` (with `hasSpinner`), an uploading `Thumbnail`, and `ChatMessageList` while it loads older messages announce their busy start ("Loading") once, politely, through the shared announcement channel. The Spinner each one shows is hidden from assistive technology (`spec:AST-086` FR4, FR6, FR8). Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip; in `ChatMessageList` it was also a second live role inside the log. Tests that found these Spinners with `getByRole('status', {name: 'Loading'})` should query the Spinner element or the owner's busy state instead. (#7950)

@cixzhang
