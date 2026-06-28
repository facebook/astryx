---
'@astryxdesign/core': patch
---

[fix] Fix HoverCard SSR hydration mismatch when used inside an SSR Client Component (#3107). The floating layer now renders inline instead of portaling to `document.body`, so server and client markup match. No API change.
@cixzhang
