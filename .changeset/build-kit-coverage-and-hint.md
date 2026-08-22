---
'@astryxdesign/cli': patch
---

[fix] build: a page that matched one word of the query is no longer offered as a direct match (#5320). A page template's keywords include every component its source renders, so `build "actionable warning banner"` returned `login`, `contact-form` and `documentation-design` at 95 apiece — an exact keyword hit on "banner" alone, plus the coverage garnish, landing exactly on the direct-match threshold. Three pages that are not warnings, presented as the page to start from. Coverage now gates the pages group rather than garnishing its score, and a kit that comes back thin says so, naming the browse commands, so a caller does not read it as "the package has nothing".

@josephfarina
