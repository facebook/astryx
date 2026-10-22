---
'@astryxdesign/core': patch
---

[fix] A `Button` first rendered with `isLoading` (for example after a remount) now mounts its visually hidden loading live region empty and writes "Loading" into it on the next frame, so screen readers announce the busy start instead of skipping a live region born holding its text (`spec:AST-086` FR3). A Button that becomes loading after it mounts is unchanged, and a Button mounted idle does no extra render.

@cixzhang
