---
'@astryxdesign/core': patch
---

[feat] CheckboxInput and Switch now name their own label as a theme target: `astryx-checkbox-label` and `astryx-switch-label`, alongside the `astryx-field-label` every label already carries. A theme could previously only reach one `astryx-field-label` target, so styling a checkbox's label — which shares a row with its control — meant styling every form field's label above its input too. The control passes the target down, so the name says what the thing is rather than encoding how it is arranged, and nothing can set it untruthfully.

@freddymeta
