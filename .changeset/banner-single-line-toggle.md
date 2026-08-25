---
'@astryxdesign/core': patch
---

[fix] Banner: a title-only collapsible banner now centers its header, as a title-only banner with any other control already does. `isSingleLine` counted `endContent` and the dismiss button but not the collapse toggle, so a banner whose only control was the toggle kept `align-items: flex-start` — leaving its icon and title 4px above the 28px toggle they sit beside, while the same banner with a dismiss button centered correctly.

@freddymeta
