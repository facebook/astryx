---
'@astryxdesign/cli': patch
---

[docs] `astryx docs migration`, `internationalization`, `styling`, `styling-libraries`, `typography` and `tokens` still work and now list focused guides. Section reads move under them, for example `astryx docs tokens/tokens-spacing` or `astryx docs styling/tokens-and-setup stylex-setup`; the old `astryx docs <topic> <section>` form for these six no longer resolves. `astryx docs tokens --depth all --detail full` prints every token table, and a `token-ref` to `tokens` keeps resolving through the guide that holds the table.

(#7184)
@josephfarina
