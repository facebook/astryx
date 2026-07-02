---
'@astryxdesign/core': patch
---

[fix] button: sizes use `min-height` with per-size `paddingBlock` instead of a fixed `height`, so theme `paddingBlock` overrides grow the button instead of being absorbed by border-box. default geometry is unchanged (sm 28px / md 32px / lg 36px) and icon-only buttons stay square via `aspect-ratio` (#3379).
@arman-luthra
