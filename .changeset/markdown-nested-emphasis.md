---
'@astryxdesign/core': patch
---

[fix] Markdown: pair emphasis and strong markers by CommonMark's rules, so strong inside emphasis keeps its strong
@cixzhang

Runs of `*` and `_` now pair as CommonMark specifies: by which side of a word they touch, by the nearest compatible opener, and by the rule of three. `*see **bold** more*` and `*see **bold***` render the bold inside the emphasis, `**bold *both***` renders the emphasis inside the strong, `__foo, __bar__, baz__` nests, and an escaped `\*` inside emphasis stays literal. Before, the first matching marker closed emphasis early and left stray `*` or `_` in the text. `***text***` still renders as strong around emphasis. Streaming closes an unfinished `**bold` before trailing spaces, so the partial text keeps its formatting.
