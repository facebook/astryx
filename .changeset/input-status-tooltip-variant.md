---
'@astryxdesign/core': patch
---

[feat] Bordered inputs gain a `statusVariant="tooltip"` option that hides the status message box and surfaces the message in a tooltip on the on-field status icon. The message is piped into the input's `aria-describedby` so assistive tech still announces it. Added to TextInput, TextArea, NumberInput, DateInput, DateRangeInput, TimeInput, and FileInput.

@cixzhang
