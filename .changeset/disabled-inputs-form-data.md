---
'@astryxdesign/core': patch
---

[fix] TextInput, TextArea, NumberInput: a disabled field is no longer submitted with the form when `disabledMessage` is set. Showing the reason tooltip requires swapping the native `disabled` attribute for `aria-disabled` + `readOnly`, so the message stays discoverable by pointer and keyboard — but read-only fields still serialize into `FormData`, and these three kept their `name`, so a locked field posted its value. They now withhold the `name` while disabled, matching CheckboxInput and Switch (which forward the name only when enabled) and the hidden-input carriers in Selector, MultiSelector, Slider, and Tokenizer (which mirror `disabled`). Adds form-participation coverage to all three so the guarantee is pinned. (#4811)
@josephfarina
