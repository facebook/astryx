---
'@astryxdesign/core': patch
---

[feat] The bordered input family now accepts a `statusVariant` prop (`'attached' | 'detached'`, default `'attached'`) that forwards to the underlying `Field`, letting you float the status message below the input with spacing instead of overlapping it. Added to TextInput, TextArea, NumberInput, DateInput, DateRangeInput, TimeInput, Selector, MultiSelector, Typeahead, Tokenizer, FileInput, and PowerSearch. Non-breaking: the default matches today's behavior. (#4187)

@cixzhang
