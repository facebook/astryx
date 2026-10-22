---
'@astryxdesign/core': patch
---

[fix] `DateTimeInput` and `TimeInput` (popover, native and bottom-sheet presentations) announce their busy start ("Loading") once, politely, through the shared announcement channel, and the Spinner they show while busy is hidden from assistive technology (`spec:AST-086` FR6, FR8). Before, that Spinner mounted as its own `role="status"` region already named "Loading", which screen readers often skip, and it was a second owner beside the field's `aria-busy`. A change made inside the open bottom sheet under a pending `changeAction` is announced from inside the sheet. Tests that found the busy Spinner with `getByRole('status', {name: 'Loading'})` should check the field's `aria-busy` instead.

@cixzhang
