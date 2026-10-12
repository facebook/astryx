---
'@astryxdesign/core': minor
---

[breaking] Markdown renders a ```diff fence as tinted diff rows instead of plain text, and `CodeBlock` gains `isDiff`, a diff layer over any `language`.

With `isDiff`, lines starting with `+` sit on a success-tinted row, `-` on an error-tinted row, `@@` hunk headers (and a `--- `/`+++ ` file-header pair directly before one) on a quiet muted row, and the rest of every line keeps the language's syntax highlighting. The glyph renders in its own column so the code's indentation lines up on every row, stays in the copied text, and takes the row's text colour on tinted rows. The tints are three new syntax-theme slots — `--color-syntax-added`, `--color-syntax-removed`, `--color-syntax-diff-header` — that default to `--color-success-muted` and `--color-error-muted` at 25% strength and to `--color-background-muted`, so existing and custom syntax themes need no change and may override them.

Markdown maps a ```diff-<lang> fence to the layer over `<lang>` (labelled `<lang> diff`) and a ```diff fence to the layer over plaintext (labelled `diff`), so a diff keeps its header, copy button, disclosure, and a viewport name that still says `diff`.

Migration: a ```diff fence that should stay plain text becomes a ```text fence. A custom `components.code` renderer is unchanged: it keeps receiving the fence's leading word characters in `language` (`diff` for both ```diff and ```diff-tsx, as today), so an existing `language === 'diff'` check still matches, and receives nothing new.
@cixzhang
