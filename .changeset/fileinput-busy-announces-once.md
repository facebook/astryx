---
'@astryxdesign/core': patch
---

[fix] `FileInput` announces its busy start ("Loading") once, politely, through the shared announcement channel, and the Spinner it shows while busy is hidden from assistive technology (`spec:AST-086` FR6, FR8). Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip. A file pick keeps its single "file selected" announcement, because it is one user action, even when it starts a busy period (`changeAction`, or `isLoading` set from `onChange`). Other busy starts, such as `isLoading` on its own or a clear under `changeAction`, announce "Loading". Inside an open modal dialog the announcement goes to a status region in the dialog. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the field's `aria-busy` instead.

@cixzhang
