---
'@astryxdesign/core': patch
---

[feat] Native form participation for custom inputs via htmlName (#3343)

Switch, CheckboxInput, RadioList, Slider, Selector, MultiSelector, and Tokenizer now accept the same `htmlName` prop TextInput and NumberInput already had, so they serialize into native form submission. Components with a real native input (Switch, CheckboxInput, RadioList) forward the name; the synthetic controls render hidden inputs that mirror native semantics — one entry per value for MultiSelector/Tokenizer (like a multi-select), string value for Slider (two entries in range mode), and exclusion from FormData when disabled.
@arham766
