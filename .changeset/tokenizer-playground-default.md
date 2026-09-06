---
'@astryxdesign/core': patch
---

[fix] Tokenizer: render and interact in the docsite properties preview (#5982)

Seeds playground defaults for the required `value` array so the properties-tab preview shows a labeled field with tokens on first load instead of the missing-required-props placeholder, and wires the preview's `onChange` bridge back to the controlled `value` so removing a token updates the field.

@Kyujenius
