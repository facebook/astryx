---
'@astryxdesign/core': patch
---

[fix] MultiSelector: a `hasCreate` creation the caller refuses, by leaving it out of `value`, no longer clears the search, so the typed name stays to be corrected instead of having to be typed again. The search clears and the creation is announced once `value` carries the new entry, and a second pick of the same text while a change action is still pending is ignored.

@vjeux
