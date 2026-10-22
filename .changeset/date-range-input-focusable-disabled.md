---
'@astryxdesign/core': patch
---

[fix] DateRangeInput: a disabled or busy field and a disabled preset no longer render native `disabled`. The trigger, calendar button and presets keep their place in the focus order and expose `aria-disabled`, while opening and selecting stay blocked, and a focused disabled field shows its focus ring. Tests that query them with `toBeDisabled()` or `:disabled` should check `aria-disabled="true"` instead.

@cixzhang
