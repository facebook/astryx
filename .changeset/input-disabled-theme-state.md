---
'@astryxdesign/core': patch
---

[feat] The input family (TextInput, NumberInput, DateInput, DateRangeInput, DateTimeInput, TimeInput, TextArea, Tokenizer) now reflects its disabled state on the root theming target as `data-disabled="disabled"` plus a `.disabled` variant (only when disabled), so a theme can gate its own hover/border treatment on the disabled state — mirroring the existing `status`/`size` reflection — instead of relying on structural `:has(input:disabled)` CSS. This closes a documented theming gap for downstream consumers. (#4794)

@freddymeta
