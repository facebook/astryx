---
'@xds/core': minor
---

`<XDSMarkdown>` gains an opt-in `autolink` prop. Setting `autolink="gfm"` enables GitHub-Flavored Markdown autolink-literal rules: bare `https?://…`, `www.…`, `<scheme:url>`, `<email>`, and `user@host` all render as links. Trailing sentence punctuation (`?!.,:*_~`) and unbalanced trailing `)` are excluded; matches inside code spans, code blocks, existing links, and image alt text are skipped. Default behavior is unchanged.

The same option is also available on `parseMarkdown`, `parseInline`, and `parseMarkdownIncremental` via a new `ParseOptions` argument (`{sourceIds?, autolink?}`); the existing `ReadonlySet<string>` positional signature is preserved.
