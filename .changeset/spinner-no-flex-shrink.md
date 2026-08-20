---
'@astryxdesign/core': patch
---

[fix] Spinner: the spinner box no longer shrinks when a flex host is smaller than it. Several components paint a spinner inside a fixed-size control — a Switch thumb is 14px at the smallest size, exactly the default box — and under the default `flex-shrink: 1` the parent compressed the box while the canvas kept drawing at the size the vars asked for, so the ring painted outside its own clipped box. The two are now the same measurement, which makes a spinner that does not fit visibly wrong at the host instead of silently mismatched. No change at any default size or shade.

@freddymeta
