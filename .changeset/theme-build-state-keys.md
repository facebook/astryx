---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` no longer warns `Unknown prop` for documented state override keys. Component docs declare state-driven selectors under `theming.targets[].states` (`radio` → `checked`/`disabled`, `calendar-day` → `today`/`selected`, …), but override validation only loaded `visualProps`, so the state syntax the Theming Infrastructure wiki documents — `components: {radio: {checked: {...}}}` — warned on every build. The CSS was always generated correctly; only the warning was wrong. 30 targets across core were affected.

@cixzhang
