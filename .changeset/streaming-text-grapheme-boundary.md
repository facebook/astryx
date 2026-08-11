---
'@astryxdesign/core': patch
---

[fix] `useStreamingText` no longer renders a broken glyph (a lone surrogate, or a partial ZWJ emoji sequence) for one frame when its fixed-code-unit reveal cadence happens to land inside a surrogate pair or multi-codepoint emoji. The rendered slice now snaps back to the nearest grapheme cluster boundary via `Intl.Segmenter` (with a surrogate-pair-safe fallback where it's unavailable); the reveal cadence itself is unchanged. Also corrected the hook's doc comment, which inaccurately described the cadence as advancing on word/syntax boundaries — it always advanced by fixed code units.

@HelloOjasMutreja
