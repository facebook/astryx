---
'@astryxdesign/core': patch
---

[fix] NumberInput: commit each text edit as one draft on blur or Enter, so invalid typed and pasted input consistently preserves the prior value instead of committing a valid prefix. This also prevents Pagination from navigating to an intermediate prefix while preserving live inline Table filtering and PowerSearch's Enter-to-save behavior.

@cixzhang
