---
'@astryxdesign/core': patch
---

`useListFocus` gains opt-in roving-tabindex ownership (`rovingTabIndex`), caret-aware arrow handling for nested text inputs (`deferToCaret`), RTL horizontal navigation (`isRtl`), an `enableHomeEnd` toggle, and `orientation: 'both'` for four-arrow navigation. `Toolbar` now uses it — it is a single tab stop (#3343) and no longer steals the caret from a toolbar text input.
