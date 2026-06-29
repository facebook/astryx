---
'@astryxdesign/core': patch
---

[fix] Table: the header row no longer picks up the `hasHover` row highlight — hover (and striped) styling now applies to body rows only. Adds an internal `isHeaderRow` flag on the row component so the header row in `<thead>` opts out (#2734)
@durvesh1992
