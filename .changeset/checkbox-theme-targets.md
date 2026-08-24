---
'@astryxdesign/core': patch
---

[feat] CheckboxInput and the checkbox indicator now expose stable theme targets for their inner elements — `astryx-checkbox-input-slot` (the control's box slot) and `astryx-checkbox-input-control` (the native `<input>`), plus `astryx-checkbox-indicator-check` and `astryx-checkbox-indicator-dash` for the two marks, mirroring the existing `astryx-radio-indicator-dot`. All four reflect `size`. The slot and the native input were the only elements in CheckboxInput's tree carrying no `themeProps`, so a theme resizing the control had to reach them with `input[type='checkbox']` and `:has(> input[type='checkbox'])`. Purely additive; no visual change.
@freddymeta
