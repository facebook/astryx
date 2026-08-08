---
'@astryxdesign/core': patch
---

[fix] Two theme targets that never reached the DOM now render. `ChatSendButton` spread `themeProps('chat-send-button')` and then overwrote it with `className={className}`, and `RichTextEditor`'s input wrapper overwrote it with both `stylex.props()` and `className={className}`; in each case React kept only the last `className`, so the stable `astryx-*` class was dropped. On `RichTextEditor` the wrapper also lost every StyleX class and its `xstyle` passthrough, leaving the field with no border, padding, disabled or status styling.

**Appearance may change** if you already style these surfaces: `.astryx-chat-send-button` and `.astryx-rich-text-editor` selectors (in a `defineTheme` `components` override or plain CSS) matched nothing before and now match. A `RichTextEditor` will also pick up the wrapper styling — and any `xstyle` you passed it — that was previously discarded.

@cixzhang
