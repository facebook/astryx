---
'@astryxdesign/core': patch
---

[fix] Avatar: fallback initials no longer split multi-codepoint characters (emoji, flag sequences, base+combining-mark letters) when deriving initials from a name — `getInitials` now segments by grapheme cluster instead of UTF-16 code unit.

@alex-js-ltd
