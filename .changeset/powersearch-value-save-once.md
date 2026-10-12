---
'@astryxdesign/core': patch
---

[fix] The PowerSearch filter editor saves once when a value that saves on choice is picked (an enum option, a relative-date preset, a suggestion). The save no longer runs inside a React state updater, which React may call more than once, so it no longer fires twice in StrictMode.

@cixzhang
