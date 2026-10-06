---
'@astryxdesign/core': patch
---

[feat] Export `decodeMarkdownCharacterReferences` from `@astryxdesign/core/Markdown/parser` and `@astryxdesign/core/Markdown`
@cixzhang

It decodes character references the way `Markdown` renders them — `&copy;`, `&#169;`, and `&#xA9;` become `©`; unknown names and references without their semicolon stay as written — using the same table `Markdown` uses. It works on plain text, so leave code and backslash-escaped references out. The parser subpath has no use-client boundary, so server code can call it.
