---
'@astryxdesign/cli': patch
---

[fix] A debug event keeps the start of a command's output when the output comes in one big write.

Each stream's capture is limited to 32 KB. The recorder added a write's size before checking the limit, so a single write over 32 KB was dropped instead of cut. `astryx template --list` prints about 150 KB in one write, and its event kept only the truncation marker. Output that arrives in many small writes wasn't affected.

Now the event keeps the first 32 KB, cut on a character boundary, and the marker still reports the real size. The recorder holds some output past the limit and scrubs it before cutting, so a token or private key that crosses the limit is removed whole instead of leaving a piece the scrubber can't recognize. That also covers a secret split across two writes at the limit, which could leave a piece before. When output runs past what the recorder holds, nothing from the last 16 KB it holds is kept, so a secret cut off there can only show up if it's longer than that. Nothing extra runs while a command prints: the scrub and the cut happen when the event is delivered, and only when a project has a `debug` handler.

@josephfarina
