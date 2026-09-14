---
'@astryxdesign/core': patch
---

[fix] CodeBlock no longer crashes on custom tokenizer types the built-in grammar doesn't know (a dotted type like `keyword.control.sql` took the whole block down). Generated highlight and custom-property names are now passed through CSS.escape before entering the dynamic stylesheet, so every name Chromium accepts — dotted, digit-led, `_private`, non-ASCII — keeps its colours, while a token type can never step outside its ident and shape the rule.

@bhamodi
