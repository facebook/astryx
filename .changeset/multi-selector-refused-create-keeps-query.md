---
'@astryxdesign/core': patch
---

[fix] MultiSelector: a `hasCreate` creation the caller refuses, by leaving it out of `value`, no longer clears the search, so the typed name stays to be corrected instead of having to be typed again (WCAG 2.2 SC 3.3.7 Redundant Entry). Before, picking the create row cleared the search and announced "{label} created" at once, whether or not the caller added the option. Now the creation is announced, and the search clears, once `value` carries the new entry, whether the caller accepts in the same update, inside a transition or when a change action settles. Two creations accepted during one change action are each announced, and creations accepted together are announced as one message with their count. A second pick of the same text while a change action is still pending is ignored.

@vjeux
