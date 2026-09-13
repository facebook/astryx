---
'@astryxdesign/core': patch
---

[feat] expose the Dialog title/inline context via the @astryxdesign/core/Dialog/DialogContext subpath so composed headers outside core (lab's DialogHeroHeader) can join the aria-labelledby title handshake and inline-preview autofocus suppression, the same naming contract DialogHeader uses. Apply default hero-title focus after the modal opens, preferring an eligible explicit descendant request and preserving the invoking control for focus return (#4182)
@jiunshinn
