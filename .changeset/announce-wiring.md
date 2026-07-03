---
'@astryxdesign/core': patch
---

[fix] Announce file selection, page changes, and multi-select count via the live-region hook (#3343)

FileInput now announces successful file selection, Pagination announces page changes, and MultiSelector announces selection-count changes, all through the shared visually-hidden polite live region so these previously-silent surfaces are audible to screen-reader users.
@cixzhang
