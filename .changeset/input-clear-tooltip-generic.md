---
'@astryxdesign/core': patch
---

[fix] Clearable inputs: the clear button's tooltip now reads just "Clear" (localized) instead of repeating the field's label, so a long label no longer turns into awkward tooltip copy such as "Clear Assigned engineering partner". The button's accessible name is unchanged and still names the field, such as "Clear Search". Applies to every input that renders the shared clear button, including `TextInput`, `NumberInput`, the date and time inputs, `FileInput`, `Selector`, `MultiSelector`, `Typeahead`, and `Tokenizer`. Override the new `@astryx.inputClearButton.tooltip` catalog key to change the wording.

@athz @cixzhang
