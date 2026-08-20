---
'@astryxdesign/core': patch
---

[fix] Theming: a physical `paddingTop`/`paddingBottom` now reaches the container padding expansion, so `card`, `dialog`, `section` and `number-input` track it the way they already track the logical spellings. A physical block longhand matched none of the padding property names the expansion recognizes, so it landed raw on the element while the component's internals kept reading the default — the NumberInput stepper column came up ~10px short of the field edges, and container bleed compensated by the wrong amount. Mixing spellings was worse than either alone: `padding: '10px'` plus `paddingTop: '14px'` published 10px in the tokens while the element painted 14px on top. `padding-top` and `padding-bottom` ARE the block edges in every horizontal writing mode, so this normalization assumes no direction. `paddingLeft`/`paddingRight` are deliberately unchanged: they are direction-relative — left is inline-start in LTR and inline-end in RTL — and the tokens are consumed by logical properties, so routing them would silently move the padding to the opposite edge under RTL. They keep their physical meaning, exactly as before.

@cixzhang
