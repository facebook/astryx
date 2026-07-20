---
'@astryxdesign/core': patch
---

[fix] Forward rest props in Dialog and DialogHeader. DialogHeader now passes through data-testid, aria-*, and other attributes. Dialog's inline path forwards all rest props. Standard path spreads rest before contract props so onClick, onCancel, aria-modal, and role cannot be clobbered.

@cixzhang
