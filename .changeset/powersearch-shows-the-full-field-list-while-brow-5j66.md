---
'@astryxdesign/core': patch
---

[fix] PowerSearch now shows up to 1,000 configured fields when the search box is empty, instead of stopping at 10. Typed searches still show 10 ranked results by default; use `maxSearchResults` to change only that limit. (#5233)
@nynexman4464
