---
'@astryxdesign/core': patch
---

[docs] LayoutFooter: seed playground defaults and a Layout footer-slot wrapper for the docsite preview (#5895)

Prevents the properties-tab preview on the docsite from rendering an empty stage by seeding representative footer content and mounting LayoutFooter in the Layout wrapper's footer slot, so the preview shows a docked footer instead of a centred label.

@Rijul202
