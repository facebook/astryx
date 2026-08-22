---
'@astryxdesign/core': patch
---

[feat] TabList: a new `mode` prop chooses which ARIA pattern the strip speaks. `nav` stays the default and is unchanged — a navigation landmark whose current item is marked with `aria-current`. `mode="tablist"` implements the WAI-ARIA tabs pattern instead: `role="tablist"` on the strip, `role="tab"` and `aria-selected` on the tabs, and `aria-controls` pointing at the panel each tab opens, taken from a new `panelId` prop on `Tab`. The keyboard behaviour the pattern asks for was already there — arrows move between tabs, Tab leaves the strip. Because a tab swaps a panel in place rather than navigating, an `href` is ignored in this mode and the tab stays a button, and because a tablist owns only tabs, anything else rendered inside the strip produces a development warning naming what it found. Both warnings are development-only.

@cixzhang
