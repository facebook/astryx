---
'@astryxdesign/core': patch
---

[fix] TimeInput: a disabled field, or a busy bottom-sheet field, no longer renders native `disabled` on its typed, native-picker or touch input or its picker button. They keep their place in the focus order and expose `aria-disabled`, while typing, arrow-key adjustment, opening, submitting a surrounding form with Enter, and a caller's `onClick` stay blocked, a draft typed before the field became disabled is dropped, and a focused disabled field shows its focus ring. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR6). Tests that query a disabled or busy TimeInput with `toBeDisabled()` or `:disabled` should check `aria-disabled="true"` instead.

@cixzhang
