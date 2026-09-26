---
'@astryxdesign/core': patch
---

[fix] Restore focus to the element that opened a Dialog when its content mounts in the open commit. The opener was captured in the Dialog's passive effect, which runs after a freshly mounted DialogHeader's autofocus effect had already moved focus to the dialog's own title — closing then restored focus to that detached title and the user's focus landed on `<body>`. The capture now runs in a layout effect, before any descendant's passive effect. A DialogHeader mounted while its dialog is closed also no longer focuses its title; it focuses when the dialog opens. (#5637)

@ManoharPaturi
