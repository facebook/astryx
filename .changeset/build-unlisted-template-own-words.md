---
'@astryxdesign/cli': patch
---

[fix] `astryx build` starts from a page template its word weights do not list (an integration's template, or one added since the weights were fit) only when the request names as many words of that template's own display name, category and keywords as of the best listed template; otherwise it starts from that listed template and offers the other as the first alternative.

@josephfarina
