---
'@astryxdesign/core': patch
---

[fix] Layer content starts with theme body typography and neutral text formatting. Core layers end ancestor React surface/group membership as a whole, including group-owned disabled state, selection, callbacks, and label associations. Place intentional groups and complete required providers inside the layer. Unrelated contexts, explicitly authored props, themes, and styling overrides remain unchanged. Structural CSS isolation is incomplete: layers opened from Step content can still pass an outer `--step-connector-gap` to an inner Stepper. Lab Drawer receives the text baseline but retains ancestor React provider inheritance.
@cixzhang
