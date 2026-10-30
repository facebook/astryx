---
'@astryxdesign/core': patch
---

[fix] Selector's touch sheet no longer points screen readers at an option that isn't there yet. On the first open in the bottom-sheet presentation, the trigger used to report the active option (`aria-activedescendant`) while the sheet was still loading and none of its options existed. The trigger now names the active option only once the sheet has rendered it.

@cixzhang
