---
'@astryxdesign/core': patch
---

[chore] Internal: under a finger, a looping picker wheel with fewer rows than its cylinder shows repeats around the whole cylinder, as UIPickerView does. No shipped column loops yet: the minute columns that do (every 10, 15, 20 or 30 minutes) announce it with the change that passes `isLooping`. Before, a list of fewer than 11 rows ignored `isLooping` and stopped at its ends. Now a drag or a fling runs on through the seam, a key steps in its own direction across it, and a tap on a copy turns the wheel onto that copy, committing nothing when it holds the same value. Each value is still listed once for assistive technology.

@vjeux
