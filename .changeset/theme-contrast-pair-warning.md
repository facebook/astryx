---
'@astryxdesign/cli': patch
---

[fix] `astryx theme build` warns when a theme overrides one side of a colour pair and leaves the other.

`expandColorScale` holds generated text at 4.5:1 and control boundaries at 3:1 for any accent — but only for what it generated. Replace `--color-accent` in `tokens` and the `--color-on-accent` beside it still holds the value derived for the colour that is no longer there, so a theme ships below-AA text without anyone writing a bad colour, and nothing says so until someone measures rendered pixels. The build now measures ten fill/label, text/surface and boundary/surface pairs in both colour modes, and warns with the token you forgot: `label on the accent fill is 2.61:1 in dark mode, below 4.5:1 — you set --color-accent but left --color-on-accent`.

Scoped to pairs with exactly one side hand-written. A pair set on both sides was chosen, not silently voided, and calling it a defect is a palette opinion the shipped themes contest; a pair left entirely alone belongs to the defaults. Verified silent on all seven bundled themes, and it caught a real 2.94:1 boundary in the shipped `theme.template.ts`, now fixed.

From the theme-authoring study in #5047, where a clinical theme hand-tuned its dark accent, kept the generated on-accent, and rendered its primary button at 2.61:1.

@cixzhang
