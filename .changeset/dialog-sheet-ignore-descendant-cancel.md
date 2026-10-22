---
'@astryxdesign/core': patch
---

[fix] Dialog and BottomSheet stay open when a file picker inside them is dismissed. A file input fires a bubbling `cancel` event when its picker closes without a choice, and both components took that event for a close request of their own and closed. They now act only on a `cancel` aimed at their own `<dialog>`, so Escape and platform close requests (the Android back gesture) behave as before. No API changes.

@vjeux
