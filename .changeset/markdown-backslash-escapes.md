---
'@astryxdesign/core': patch
---

[fix] Markdown keeps a backslash unless it escapes punctuation, and a backslash at the end of a line is a line break

`C:\Users\Ada` rendered as `C:UsersAda`: any character after a backslash swallowed it. As CommonMark specifies, a backslash now escapes only ASCII punctuation (`\*`, `\#`, `\\`, …); before a letter, digit, space, or other character it stays as written. A backslash at the end of a line is a hard line break. Image alt text follows the same rule.

@cixzhang
