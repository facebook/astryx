---
'@astryxdesign/core': patch
---

[fix] Table selection: select-all no longer reads checked over an empty filtered table (#3591)

With rows selected and a filter matching nothing, the union-based all-selected check treated the invisible selection as "all selected": the header checkbox rendered checked over an empty table, and deselect-all was a no-op because the hidden keys count as frozen. Zero actionable rows now reads as not-all-selected; the frozen-selection preservation itself is unchanged.
@arham766
