---
'@astryxdesign/core': patch
---

[fix] `Tooltip`: a tooltip taller than the room above and below its trigger no longer opens over the trigger. It opens beside the trigger when there is room there, or otherwise on the side with more room, sized to that room, and it scrolls content it cannot show. Before, it slid over its own trigger, where a resting pointer could lose it, and content past the viewport could not be read. Tooltips that fit are placed exactly as before.

@ejhammond
