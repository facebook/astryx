---
'@astryxdesign/cli': patch
---

[fix] The shared CLI blog adapter (`blog.list`, `blog.detail`) cleared its 15-second abort timer as soon as `fetch` returned response headers, leaving the later body read unbounded in time, and buffered the entire response before checking the 5 MB size limit, so the limit didn't actually cap how much was read into memory.

The abort timer now stays active through body consumption. The body is read as a stream where available, checking decoded size after each chunk and aborting the read as soon as it exceeds the limit, instead of buffering the full response first.

@harjothkhara
