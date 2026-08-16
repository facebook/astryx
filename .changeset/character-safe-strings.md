---
'@astryxdesign/core': patch
---

[fix] Count and cut text the way people read it: the TextArea character counter (and its over-limit state and screen-reader announcements) counts user-perceived characters — an emoji is 1, not 2; PowerSearch token truncation no longer cuts an emoji or accented letter in half; Table's auto-generated headers capitalize astral-plane letters correctly; Avatar's initials now use the shared character utilities.

@AKnassa
