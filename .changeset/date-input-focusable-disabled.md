---
'@astryxdesign/core': patch
---

[fix] DateInput: a disabled or busy field no longer renders native `disabled`. Its input and calendar button keep their place in the focus order and expose `aria-disabled`, while typing and opening stay blocked. A focused disabled field shows its focus ring, so keyboard and screen-reader users can reach a disabled date field and hear that it is disabled. Tests that query a disabled DateInput with `toBeDisabled()` or `:disabled` should check `aria-disabled="true"` instead.

@cixzhang
