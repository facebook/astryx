---
'@astryxdesign/core': patch
---

[fix] The editable text fields in `Selector`, `MultiSelector`, `Typeahead`, `DateInput`, `DateTimeInput`, `TimeInput`, and `NumberInput` no longer misinterpret the keydown that commits or cancels an IME composition (Korean/Japanese/Chinese input) as a command. Previously a composing Enter would select/toggle the highlighted option or commit a typed date, a composing Escape would exit `Typeahead`'s edit mode, and a composing arrow would step a time or number value — all before the composition finished. Each field now lets the IME finish first, matching the guard already in place for `BaseTypeahead` and the Chat composer.

@cixzhang
