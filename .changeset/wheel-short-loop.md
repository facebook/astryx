---
'@astryxdesign/core': patch
---

[chore] Internal: under a finger, a picker wheel can loop (`isLooping`): its last row is followed by its first, as UIDatePicker's minutes and hours are, and a list with fewer rows than its column shows repeats down the whole column, as UIPickerView's looping table repeats around its cylinder. No shipped column loops yet: the time columns that do announce it with the change that passes `isLooping`. A drag or a fling runs on through the seam, a key steps in its own direction across it, and a tap on a copy turns the wheel onto that copy, committing nothing when it holds the same value. Each value is still listed once for assistive technology.

@vjeux
