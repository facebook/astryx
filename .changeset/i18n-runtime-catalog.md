---
'@astryxdesign/core': patch
---

[fix] The shipped English catalog no longer carries its translator descriptions into the bundle. (#6691)

`resolve()` used to import `locales/en.json`, whose `description` fields are context for Crowdin and never read at runtime, so every consumer's first load carried the whole file (about 92 KB raw, 23 KB gzip, for 7 KB of messages). The runtime now reads a generated `enMessages.ts` projection (about 23 KB raw, 5 KB gzip); `en.json` stays the source of truth and `check:i18n-catalog` fails when the projection drifts. No API or behavior change.

@vjeux
