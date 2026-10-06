---
'@astryxdesign/cli': patch
---

[fix] A debug event keeps the start of a command's output when the output comes in one big write.

Each stream's capture is limited to 32 KB. The recorder added a write's size before checking the limit, so a single write over 32 KB was dropped instead of cut. `astryx template --list` prints about 150 KB in one write, and its event kept only the truncation marker. Output that arrives in many small writes wasn't affected.

Now the event keeps the first 32 KB, cut on a character boundary so a multi-byte character is never split, and the marker still reports the real size. A write that gets cut ends the capture, so the kept text is always the start of what was printed.

@josephfarina
