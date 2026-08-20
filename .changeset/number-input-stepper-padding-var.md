---
'@astryxdesign/core': patch
---

[fix] NumberInput: the number-stepper column now tracks a themed padding and radius instead of assuming the defaults. Theming `number-input` padding left the steppers short of the field edges (a gap top and bottom), and a themed `borderRadius` rounded the field while the stepper corners kept the default radius. The wrapper's padding now goes through the shared container expansion, so it is picked up from any spelling a theme writes it in — `padding: 14px 20px`, `paddingBlock`, or a single `paddingBlockStart` — and both the wrapper and the column read the resulting per-side `--astryx-number-input-padding-*` tokens; an asymmetric `paddingBlock: 4px 12px` is cancelled correctly at each edge. A themed `number-input` borderRadius now also reaches `--_field-radius`, which the column's outer corners follow. Byte-identical by default, and inert for the no-stepper case and every other input.

@freddymeta
