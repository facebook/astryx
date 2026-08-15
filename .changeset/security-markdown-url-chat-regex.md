---
'@astryxdesign/core': patch
---

[fix] Security: reject `javascript:`, `vbscript:` and `data:text/html` URLs in the Markdown parser, so untrusted markdown can no longer produce an executable link href or image src; and fix `escapeRegExp` in `ChatTokenizedText`, whose character class closed early and left `]` and `\` unescaped, so token values containing them were injected raw into a `RegExp`
@Sunil56224972
