---
'@astryxdesign/core': patch
---

[refactor] useTreeFocus gains `hasRovingTabIndex` + `handleFocus` for internal tab-stop management; TreeList drops its inline `activeId` state and lets the hook own the roving tab stop (#3488).
@cixzhang
