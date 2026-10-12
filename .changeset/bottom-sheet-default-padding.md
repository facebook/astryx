---
'@astryxdesign/core': minor
---

[breaking] BottomSheet pads its content by default, like Dialog. With no `padding` prop and no theme padding, the content box now pads by `--spacing-4` (it had no padding before) and publishes that inset.

A sheet whose only child is a padded `Section` or a `Layout` renders as before, because both escape the inset. Content that supplies its own inset is now padded twice: drop that inset, or pass `padding={0}` to keep the unpadded content box. `astryx upgrade` ships `preserve-bottom-sheet-content-padding`, which adds `padding={0}` where needed.

Migration: pass `padding={0}` to keep the unpadded content box, or drop your own inset to take the default; `astryx upgrade` adds `padding={0}` to every BottomSheet that sets no padding unless its only child is a padded Section or a Layout.

@imdreamrunner
