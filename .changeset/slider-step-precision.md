---
'@astryxdesign/core': patch
---

[fix] Slider: round snapped values to the min/step decimal precision

With fractional steps, `min + steps * step` accumulated binary floating-point error, so a keyboard nudge on a `step={0.1}` slider emitted `0.30000000000000004` through `onChange`/`onChangeEnd` (and into `aria-valuenow`/the value tooltip once the consumer echoed it back). Snapped values are now rounded to the combined decimal precision of `min` and `step`, which removes only the error — exact steps are unaffected.
@arham766
