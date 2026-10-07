---
'@astryxdesign/core': patch
---

[fix] Markdown: decode character references and backslash escapes in link destinations, and close link text at an unescaped bracket
@cixzhang

A link or image destination now reads as CommonMark specifies: `[x](https://a.com/?a=1&amp;b=2)` links to `https://a.com/?a=1&b=2`, `[x](a\)b)` links to `a)b`, and reference definitions decode the same way. The URL safety check runs on the decoded destination, so an encoded unsafe scheme such as `&#106;avascript:` is refused like the plain one. Link text and image alternative text close at the first unescaped `]`, so `[a\]b](u)` is a link with the text `a]b`.
