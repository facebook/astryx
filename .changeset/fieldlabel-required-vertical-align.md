---
'@astryxdesign/core': patch
---

[fix] Vertically center the optional/required indicator in `FieldLabel`.

The `label` and `optionalRequired` styles never set an explicit `lineHeight`,
so both fell back to `line-height: normal` (~1.2), producing mismatched line
boxes (~16.8px for the 14px label vs ~14.4px for the 12px "∙ Required" text).
With `alignItems: center` the smaller indicator centered within its shorter box
and rendered visually high relative to the label.

Applying the intended leading tokens (`--text-label-leading` and
`--text-supporting-leading`, both 20px) gives the two flex children equal line
boxes so they center correctly. Affects every field that renders a
required/optional indicator via `FieldLabel` (`Field`, `Typeahead`,
`CheckboxInput`, `Switch`).

@athz
