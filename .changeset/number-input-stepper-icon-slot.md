---
'@astryxdesign/core': patch
---

[feat] NumberInput steppers now resolve through the component-owned `numberInput:stepperDown` icon key, leaving `chevronDown` for shared disclosure and navigation affordances. Core provides a compact centered chevron fallback, and themes can override the stepper independently without adding a required `IconRegistry` key.

@rubyycheung
