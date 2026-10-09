---
'@astryxdesign/cli': patch
---

[docs] `astryx docs migration`, `internationalization`, `styling`, `styling-libraries`, `typography` and `tokens` still work and now list focused guides. Read a section through the guide that holds it, for example `astryx docs tokens/tokens-spacing` or `astryx docs styling/tokens-and-setup stylex-setup`. `astryx docs tokens --depth all --detail full` prints every token table, and a `token-ref` to `tokens` keeps resolving through the guide that holds the table.

Integrations: these six names are now docs-tree sections, not topics, so an integration doc that declares `extends` or `replaces` with one of them is reported as naming no topic, and its content no longer shows. To keep that content, ship it as your own topic under a new name, or as a guide in your package's own section (`astryx integration add doc <name> --parent <your-section>`). Topics that are still flat, such as `theme` or `color`, can still be extended or replaced.

(#7184)
@josephfarina
