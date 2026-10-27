---
'@astryxdesign/core': patch
---

[chore] The internal action-group tracker paints its highlight through the one press writer in `utils/pressFeedback.ts`, as the document's press controller does, so neither cuts the other's fade short and a `held` paint is left alone. No component uses the tracker yet, and no package entry point exports it.

@vjeux
