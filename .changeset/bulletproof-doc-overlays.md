---
'@astryxdesign/cli': patch
'@astryxdesign/core': patch
---

[fix] Anchor reference-doc `--dense` / `--zh` overlays by section title + block id (prose-only), replacing the positional merge so an overlay can never drop, misalign, or override canonical content. Every reference-doc block gets a stable id; a CI gate enforces id coverage and prose-only overlays. Fail-safe: anything an overlay does not resolve falls back to canonical English.

@josephfarina
