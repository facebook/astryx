---
'@astryxdesign/core': patch
---

[fix] `BaseTypeahead` (and everything built on it — `Typeahead`, `Tokenizer`, `PowerSearch`'s content-search field) no longer misinterprets the Enter keydown that commits an IME composition (Korean/Japanese/Chinese input) as "accept the highlighted suggestion". Previously that keydown both selected the highlighted result and cleared the input, so the still-composing syllable landed in the freshly-cleared field and became its own spurious second selection on the next Enter. Also guarded the Enter-to-save handler in `PowerSearchEditPopover`, which had the same gap when typing a CJK filter value.

@HelloOjasMutreja
