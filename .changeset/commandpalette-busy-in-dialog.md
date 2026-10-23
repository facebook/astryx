---
'@astryxdesign/core': patch
---

[fix] `CommandPalette` announces each busy start ("Loading"), including its load on opening or clearing the query, once from a status region inside its dialog, and its search Spinner is hidden from assistive technology (`spec:AST-086` FR3, FR8). Before, the Spinner mounted as its own `role="status"` region already named "Loading", and the palette's own "Loading" went to the page-level announcement channel, which an open native modal hides from assistive technology. Result-count announcements are unchanged. Tests that found the Spinner with `getByRole('status')` should query the Spinner element instead.

@cixzhang
