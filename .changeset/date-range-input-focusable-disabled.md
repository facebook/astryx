---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: a disabled or busy field and a disabled preset no longer render native `disabled`. The trigger, calendar button and presets keep their place in the focus order and expose `aria-disabled`, while opening and selecting stay blocked, and a focused disabled field shows its focus ring. This meets the focusable-disabled requirement in spec:AST-085 (FR1, FR2, FR6) and DateRangeInput AR3. Tests that query them with `toBeDisabled()` or `:disabled` should check `aria-disabled="true"` instead.

@cixzhang
