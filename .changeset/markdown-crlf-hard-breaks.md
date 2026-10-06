---
'@astryxdesign/core': patch
---

[fix] Markdown makes a hard line break from two spaces or a backslash before a Windows (CRLF) line ending

Documents saved with CRLF line endings lost their hard line breaks: the carriage return sat between the trailing spaces or backslash and the line feed, so neither was recognized and the lines ran together. Both now break the line exactly as they do in an LF document, in paragraphs, links, and block quotes and while streaming; code spans, code blocks, and table cells are unchanged.

@cixzhang
