---
'@astryxdesign/core': patch
---

[chore] The internal action-group tracker paints its highlight through the one press writer in `utils/pressFeedback.ts`, as the document's press controller does, so neither cuts the other's fade short, a `held` paint is left alone, and its unmount ends only the fades it started that are still running. No component uses the tracker yet, and no package entry point exports it.

@vjeux
