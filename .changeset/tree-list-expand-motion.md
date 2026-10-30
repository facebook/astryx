---
'@astryxdesign/core': patch
'@astryxdesign/cli': patch
---

[feat] Under a coarse primary pointer, a `TreeList` row's children slide out from under it as it expands while its chevron turns, and slide back under it as it collapses, as in an iOS outline list; they used to appear and vanish in a single frame. The rows below take their new places at once when the row expands, and once its children have slid away when it collapses. The motion runs on the compositor and keeps going while the page runs script; with reduced motion on, it cross-fades instead of moving. Trees driven by a mouse are unchanged.

@vjeux
