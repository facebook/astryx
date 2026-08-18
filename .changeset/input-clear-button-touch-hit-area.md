---
'@astryxdesign/core': patch
---

[fix] InputClearButton: the clear (✕) affordance now meets the WCAG 2.5.8 AA 24×24 minimum on touch. The shared button rendered a 20px glyph with a 20px tap target, so every input that clears through it — Typeahead, Tokenizer, FileInput and the rest of the family — was under the floor on a phone. An `::after` overlay now expands the tappable region to 24×24, gated behind `@media (pointer: coarse)`: on a fine pointer the hit area still matches the 20px glyph, because a mouse is precise enough and an unconditional overlay could overlap neighboring controls in dense desktop layouts. The visual glyph is unchanged at every breakpoint, and the overlay stops at 24px so it stays clear of the 8px adornment gap and the input's own caret area.

@rubyycheung
