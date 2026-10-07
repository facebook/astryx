---
'@astryxdesign/core': patch
---

[fix] Toolbar's center slot no longer clips its content, so focus rings, box-shadows, and the selected-tab indicator of a TabList in `centerContent` are drawn in full. Center content that cannot shrink and is wider than the space between the start and end slots now overflows it instead of being cut off.
@kentonquatman
