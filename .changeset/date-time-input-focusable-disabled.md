---
'@astryxdesign/core': patch
---

[fix] DateTimeInput: a disabled or busy field no longer renders native `disabled` on its text, native-picker or touch fields, or on its calendar and clock buttons. They keep their place in the focus order and expose `aria-disabled`, while typing, picking, opening and a caller's `onClick` stay blocked, and a focused disabled field shows its focus ring. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR6). TimeInput's native picker button, which shares the time segment and stays out of the tab order, also moves from `disabled` to `aria-disabled` and stays inert. Tests that query a disabled DateTimeInput with `toBeDisabled()` or `:disabled` should check `aria-disabled="true"` instead.

@cixzhang
