---
'@astryxdesign/core': patch
---

[fix] Markdown: pair link text brackets as CommonMark does
@cixzhang

`Markdown` now pairs the brackets of link text as CommonMark specifies: link text may hold balanced brackets, so `[a [b] c](u)` is one link; the innermost bracket makes the link, so `[a [b](u)` links only `b`; and a link inside link text wins, so `[a [b](u) c](v)` shows the outer brackets as text instead of nesting links.
