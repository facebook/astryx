---
'@astryxdesign/core': patch
---

[fix] Dialog's initial focus and the focus it returns on close now follow the last input: the shared focus indicator is hidden after a mouse click or tap and shown after keyboard input, including focus returned after a keyboard open and a mouse close (#7306). Text fields keep their own focus treatment.

@harjothkhara
