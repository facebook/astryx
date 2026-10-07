---
'@astryxdesign/core': patch
---

[fix] Markdown shows character references such as `&amp;`, `&copy;`, and `&#169;` as the characters they name

`Fish &amp; chips &copy; 2026` rendered with the references spelled out. Named references (every name in the HTML standard) and decimal or hexadecimal numeric references in text now render as their characters, as CommonMark specifies; inside inline code and code blocks they stay exactly as written. An unknown name or a reference without its closing `;` stays literal, and a decoded character is never read as Markdown syntax.

@cixzhang
