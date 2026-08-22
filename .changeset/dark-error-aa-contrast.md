---
'@astryxdesign/core': patch
---

[fix] The default `--color-error` in dark mode is now `#E3193B` (the same hex light mode uses, matching how `--color-success` shares one hex across modes). The previous dark value `#F5394F` held white label text at 3.76:1 — below WCAG AA's 4.5:1 for normal text — so any theme that left the status colors alone rendered a failing destructive button in dark mode. The new pair measures 4.70:1, and the error fill stays above the 3:1 non-text floor against the dark surfaces, so the destructive focus ring remains visible. A contrast assertion now covers the status pairs that fall through to `colorDefaults` (error, success, warning, and the default accent), so a future retone cannot regress silently.

Components that rendered supporting or status **text** in the error fill token now use `--color-text-red`, the pairing FieldStatus and ChatComposer already ship: Chat's message metadata and tool-call stats/errors, and the TextArea over-limit counter. The fill token is tuned for fills — as dark-mode text it sat below AA even before this change (4.37:1 on the surface) — so these reads move from failing to 8.5–11:1.

@AKnassa
