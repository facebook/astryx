---
'@astryxdesign/cli': patch
---

[feat] `build` chooses where to start with a checked-in table of word weights blended with the page ranker

- `api/build/kit/weights.mjs` scores each candidate start (the app shell and every ready page template) from the idea's stemmed words using the tables in `weights.json`, and blends those scores with the ranker's own. The blend decides the start of a whole page that search matched no template for directly; a part, an edit or a direct match starts where it did before, and the ranker's pick of a template the tables do not list stands. Without a weights file the ranker's pick stands. The response's shape is unchanged.

@josephfarina
