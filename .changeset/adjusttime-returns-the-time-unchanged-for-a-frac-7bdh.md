---
'@astryxdesign/core': patch
---

[fix] adjustTime returns the time unchanged for a fractional minute delta instead of a malformed value such as "14:30.5", so TimeInput's arrow keys ignore a fractional increment (#7823)
@aashish254
