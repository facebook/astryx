---
'@astryxdesign/core': patch
---

[fix] ChatComposerInput: the trigger menu's loading row no longer mounts as a `role="status"` region already holding its text, which screen readers could skip. The loading text is announced once per pending search through the shared polite channel instead, and a search that returns its results before the loading row is painted, such as `createStaticSource` or a cached result, announces nothing; the visible row and its `loadingText` are unchanged.

Fixes #7859.

@HelloOjasMutreja
