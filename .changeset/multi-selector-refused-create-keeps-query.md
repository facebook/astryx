---
'@astryxdesign/core': patch
---

[fix] MultiSelector: a `hasCreate` creation the caller refuses, by leaving it out of `value`, no longer clears the search, so the typed name stays to be corrected instead of having to be typed again. The creation is announced, and the search clears, once `value` carries the new entry, whether the caller accepts in the same update, inside a transition or when a change action settles; two creations accepted during one change action are each announced. A second pick of the same text while a change action is still pending is ignored.

@vjeux
