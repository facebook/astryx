---
'@astryxdesign/core': patch
---

[fix] CheckboxInput now forwards rest props (including `data-testid`) to the underlying `<input>`. Previously the component used a closed destructuring list with no `...rest` capture, so any prop not explicitly named — `data-testid`, other `data-*` attributes, etc. — was silently dropped despite `CheckboxInputProps` (via `BaseProps`) typing them as valid. Every sibling input component (TextInput, Selector, Slider, Button, Badge) already forwards rest props; CheckboxInput was the sole outlier. Rest is spread before the component's own named attributes on the `<input>`, so it cannot override `checked`, `disabled`, `type`, or any other explicitly-set prop.

@let-sunny
