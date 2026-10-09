---
'@astryxdesign/core': patch
---

[feat] Chat: support multi-word search queries via opt-in `hasMultiWordQuery` on `ChatComposerTrigger`

Adds the `hasMultiWordQuery` option to `ChatComposerTrigger`, allowing triggers to match multi-word queries with whitespace up to a 64-character boundary, hard-terminated by newlines, and protected by IME composition, stale-result, and Escape guards. Single-token triggers remain unaffected.

@Geervan
