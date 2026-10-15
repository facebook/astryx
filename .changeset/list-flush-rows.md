---
'@astryxdesign/core': patch
---

[feat] `List`: add `isFlush` to remove every item's inline inset, so item text starts on the same line as the list header, the ends of its dividers, and sibling content such as a section heading. It needs no container padding, unlike `edgeCompensation`. Rows keep their size, hit target, and hover and selection backgrounds; without the inset those backgrounds meet the text, so the default suits interactive rows. Omitting `isFlush` keeps every list as it is.

@kentonquatman
