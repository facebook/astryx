---
'@astryxdesign/core': patch
---

[fix] Grapheme-safe string handling: the TextArea character counter (and its over-limit state and screen-reader announcements) counts user-perceived characters — an emoji is 1, not 2; PowerSearch token truncation no longer splits emoji or combining marks mid-grapheme; Table's auto-generated headers capitalize astral-plane letters correctly; Avatar's initials now use the shared grapheme utilities.

@AKnassa
