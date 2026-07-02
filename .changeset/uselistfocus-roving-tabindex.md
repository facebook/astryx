---
'@astryxdesign/core': patch
---

[feat] `useListFocus` gains opt-in roving-tabindex ownership (`hasRovingTabIndex`), caret-aware arrow handling that leaves keys to nested text inputs and contenteditables (`hasCaretGuard`), RTL horizontal navigation (`isRtl`), a `hasHomeEnd` toggle, and `orientation: 'both'` for four-arrow navigation. `Toolbar` now uses it — it is a single tab stop and no longer steals the caret from a toolbar text input or composer (#3343).
@cixzhang
