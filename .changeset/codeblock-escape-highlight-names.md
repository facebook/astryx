---
'@astryxdesign/core': patch
---

[fix] CodeBlock no longer crashes on custom tokenizer types outside the built-in grammar (a dotted type such as `keyword.control.sql` threw from `insertRule` and took the whole block down). The generated `::highlight()` name and `--color-syntax-*` custom property now pass through `CSS.escape` before entering the dynamic stylesheet, so every type the CSS parser accepts (dotted, digit-led, `_private`, non-ASCII) keeps its colour, and no token type can reach outside its own highlight rule. A rule the engine still refuses costs that type its colour, never the block.

@bhamodi
