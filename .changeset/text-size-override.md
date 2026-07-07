---
'@astryxdesign/core': patch
---

[fix] Text: apply the documented `size` prop as a font-size override (#3615)

`Text` now reflects `size` in theme props and applies the corresponding typography size token after its type-based baseline styles. The override changes font size while preserving the selected text type's line-height, weight, and family behavior.

@ahfoysal
