---
'@astryxdesign/core': patch
---

[fix] Timestamp: render "just now" instead of "in a few seconds" for a value that is only a few seconds in the future, which is almost always clock skew rather than a genuine future event (#3099)
@durvesh1992
