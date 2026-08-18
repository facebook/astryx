---
'@astryxdesign/core': patch
---

[feat] FieldLabel: reflect a `layout` prop (`stacked` | `beside`) as `data-layout` so themes can style a label beside its control (CheckboxInput, Switch) differently from a stacked form-field label — for example dropping the stacked bottom margin so the text stays vertically centered. Defaults to `stacked`; CheckboxInput and Switch pass `beside` (#5183).

@freddymeta
