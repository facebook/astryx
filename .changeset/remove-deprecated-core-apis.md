---
'@astryxdesign/core': minor
---

[breaking] Remove deprecated focus-direction overrides, the hooks-path `isImeKeyEvent` re-export, and Resizable pixel-bound aliases.

**Codemod:** Run `npx astryx upgrade --apply` before updating to 0.6.0. It removes focus-hook `isRtl`, moves `isImeKeyEvent` imports to `@astryxdesign/core/utils`, and renames `minSizePx`/`maxSizePx` to `minSize`/`maxSize`.

@cixzhang
