---
'@astryxdesign/cli': patch
---

[fix] `astryx build` starts from a page template its word weights do not list (an integration's template, or one added since the weights were fit) only when the request names as many words of that template's own display name, category and keywords (search's stopwords aside) as of the best listed template, or names that template's family (the first part of its category) before the listed template's family and at most two fewer of its words; otherwise it starts from that listed template and offers the other as the first alternative.

@josephfarina
