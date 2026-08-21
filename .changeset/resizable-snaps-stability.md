---
'@astryxdesign/core': patch
---

[fix] `useResizable` no longer recreates its `expand`/`resize`/`onResizeMove` callbacks (and `props._snaps`) on every render when `snaps` is omitted. The hook previously defaulted `snaps` to a new `[]` array literal in its destructure, so every consumer that depends on those callbacks re-ran unnecessarily even when the configuration never changed. A caller-provided `snaps` array keeps its existing identity-preserving behavior.

@HelloOjasMutreja
