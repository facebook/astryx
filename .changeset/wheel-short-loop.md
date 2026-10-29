---
'@astryxdesign/core': patch
---

[chore] Internal: under a finger, a picker wheel can loop (`isLooping`): its last row is followed by its first, as UIDatePicker's minutes and hours are, and a list with fewer rows than its column shows repeats down the whole column, as UIPickerView's looping table repeats around its cylinder. The columns that loop say so in their own changesets. A drag or a fling runs on through the seam, a key steps in its own direction across it, and a tap on a copy turns the wheel onto that copy, committing nothing when it holds the same value. A rest on a disabled row beside the seam turns the shorter way round onto the nearest enabled row, and a key never turns the long way round onto one. Each value is still listed once for assistive technology.

@vjeux
