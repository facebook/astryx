---
'@astryxdesign/core': patch
---

[feat] `CodeBlock` gains `isDiff`, a diff layer over any `language`: lines starting with `+` sit on a success-tinted row, `-` on an error-tinted row, `@@`/`---`/`+++` headers on a quiet muted row, and the rest of every line keeps the language's syntax highlighting. The glyph renders in its own column so the code's indentation lines up on every row, stays in the copied text, and takes the row's text colour on tinted rows. The tints are three new syntax-theme slots — `--color-syntax-added`, `--color-syntax-removed`, `--color-syntax-diff-header` — that default to `--color-success-muted`, `--color-error-muted` and `--color-background-muted`, so existing and custom syntax themes need no change and may override them. Markdown fences ``diff-<lang> render as the layer over `<lang>`, and ``diff / ```patch as the layer over plaintext.
@cixzhang
