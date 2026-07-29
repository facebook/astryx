---
'@astryxdesign/core': patch
---

[fix] Inputs no longer show the hover ring while disabled. The shared input wrapper's disabled state now suppresses both the base and status hover shadows, so TextInput, TextArea, NumberInput, DateInput, TimeInput, Selector, MultiSelector, Typeahead, and Tokenizer stay visually inert on hover when disabled.
@cixzhang
