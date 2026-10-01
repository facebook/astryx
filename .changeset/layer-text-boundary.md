---
'@astryxdesign/core': patch
---

[fix] Prevent ancestor text formatting and surface/group context from leaking into Layer content. (#6457)

Layer content now starts with theme body typography and neutral text formatting. Core layer content no longer inherits accidental ancestor surface/group membership, including group-owned disabled state, selection, callbacks, and label associations. Intentional groups and required providers created inside the layer still apply. Unrelated contexts, explicit props, themes, and styling overrides remain unchanged.

@cixzhang
