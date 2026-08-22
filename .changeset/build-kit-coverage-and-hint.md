---
'@astryxdesign/cli': patch
---

[fix] build: a page that matched one word of the query is no longer offered as a direct match (#5320). A page template's keywords include every component its source renders, so `build "actionable warning banner"` returned `login`, `contact-form` and `documentation-design` at 95 apiece — an exact keyword hit on "banner" alone, plus the coverage garnish, landing exactly on the direct-match threshold. Three pages that are not warnings, presented as the page to start from. Coverage now gates the pages group rather than garnishing its score, and a kit that comes back thin says so, naming the browse commands, so a caller does not read it as "the package has nothing".

Score alone could not carry the gate, so `scoreQuery` now reports the coverage it already computed: `matchedTerms` / `queryTerms` on every search result, with a whole-phrase hit reporting full coverage. A single strong hit and a broad weak one land on the same score, so a caller cannot tell "one of three concepts" from "three of three" without it.

Rebased onto current `main`, which landed integration search (#5259) and the scorer-level false-direct-match fix (#5614) while this was open. Both are `main`'s implementations, untouched here — this branch no longer rewrites `gatherComponents`, so the two regressions that rewrite caused are gone with it: an integration result reports its own package again, and a broken config no longer turns a Core `button` search into an empty success. What remains is the build-side coverage gate and the thin-kit hint. The guidance-tier indexing goes up separately, as asked.

@josephfarina
