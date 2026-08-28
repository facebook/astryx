---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Icon APIs and themes accept namespaced extension keys, and NumberInput steppers use `numberInput:stepperDown` without widening the required `IconRegistry` keys (#5466)

`<Icon icon>`, `useIcon`, and `defineTheme({icons})` accept keys such as `numberInput:stepperDown` and `richtext:bold`; misspelled built-in names remain type errors. NumberInput keeps a compact centered Core fallback, while themes can override its steppers independently from the shared `chevronDown` semantic.

@cixzhang @rubyycheung
