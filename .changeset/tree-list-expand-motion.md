---
'@astryxdesign/core': patch
---

[feat] On a touch screen, a `TreeList` row's children slide out from under it as it expands, with the rows below moving down alongside and the chevron turning, and slide back under it as it collapses, as in an iOS outline list. They used to appear and vanish in a single frame. The motion runs on the compositor and keeps going while the page runs script. Lists driven by a mouse are unchanged.

@vjeux
