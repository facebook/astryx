---
'@astryxdesign/core': patch
---

[fix] `TextInput`, `TextArea`, `Selector` and `MultiSelector` announce "Loading" once, politely, through the shared announcement channel when they become busy, and the Spinner they show while busy is hidden from assistive technology (`spec:AST-086` FR6, FR8). Before, the Spinner mounted as its own `role="status"` region already holding its name, which screen readers often skip, and it competed with the control's own `aria-busy` as a second owner of the same feedback. A rerender or StrictMode replay does not repeat the announcement; settling and becoming busy again announces again. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the control's `aria-busy` instead.

@cixzhang
